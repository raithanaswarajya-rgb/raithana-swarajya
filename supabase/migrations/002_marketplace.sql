-- Normalize the profile field used by the app. Existing databases created by
-- migration 001 originally called this column `role`.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'user_role'
    ) THEN
        ALTER TABLE public.profiles RENAME COLUMN role TO user_role;
    END IF;
END $$;

DROP INDEX IF EXISTS public.idx_profiles_role;
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);

-- Refresh signup sync so new accounts always populate profiles.user_role.
ALTER TYPE public.app_language ADD VALUE IF NOT EXISTS 'hi';

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_full_name TEXT;
    v_language app_language;
    v_role user_role;
BEGIN
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    v_language := COALESCE((NEW.raw_user_meta_data->>'language')::app_language, 'en');
    v_role := COALESCE((NEW.raw_user_meta_data->>'user_role')::user_role,
                       (NEW.raw_user_meta_data->>'role')::user_role, 'consumer');

    INSERT INTO public.profiles (id, full_name, language, user_role)
    VALUES (NEW.id, v_full_name, v_language, v_role)
    ON CONFLICT (id) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            language = EXCLUDED.language,
            user_role = EXCLUDED.user_role;
    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL CONSTRAINT inventory_producer_id_fkey
        REFERENCES public.profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL CHECK (char_length(crop_name) BETWEEN 2 AND 120),
    category TEXT NOT NULL CHECK (category IN ('vegetables', 'grains', 'fruits', 'pulses')),
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'quintal')),
    price_per_unit NUMERIC(12, 2) NOT NULL CHECK (price_per_unit > 0),
    location TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    producer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, producer_id, consumer_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_inventory_updated_at ON public.inventory;
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_inventory_active ON public.inventory(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_producer ON public.inventory(producer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_consumer ON public.conversations(consumer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_producer ON public.conversations(producer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory: authenticated read active or own" ON public.inventory;
CREATE POLICY "inventory: authenticated read active or own" ON public.inventory FOR SELECT TO authenticated
USING (is_active OR auth.uid() = producer_id);
DROP POLICY IF EXISTS "inventory: producer insert own" ON public.inventory;
CREATE POLICY "inventory: producer insert own" ON public.inventory FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = producer_id AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'producer'
    )
);
DROP POLICY IF EXISTS "inventory: producer update own" ON public.inventory;
CREATE POLICY "inventory: producer update own" ON public.inventory FOR UPDATE TO authenticated
USING (auth.uid() = producer_id) WITH CHECK (auth.uid() = producer_id);

DROP POLICY IF EXISTS "conversations: participants read" ON public.conversations;
CREATE POLICY "conversations: participants read" ON public.conversations FOR SELECT TO authenticated
USING (auth.uid() = consumer_id OR auth.uid() = producer_id);
DROP POLICY IF EXISTS "conversations: consumer starts" ON public.conversations;
CREATE POLICY "conversations: consumer starts" ON public.conversations FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = consumer_id AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'consumer'
    ) AND EXISTS (
        SELECT 1 FROM public.inventory
        WHERE inventory.id = conversations.product_id
          AND inventory.producer_id = conversations.producer_id
    )
);

DROP POLICY IF EXISTS "messages: participants read" ON public.messages;
CREATE POLICY "messages: participants read" ON public.messages FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND auth.uid() IN (conversations.producer_id, conversations.consumer_id)
));
DROP POLICY IF EXISTS "messages: participants send" ON public.messages;
CREATE POLICY "messages: participants send" ON public.messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
      AND auth.uid() IN (conversations.producer_id, conversations.consumer_id)
));
