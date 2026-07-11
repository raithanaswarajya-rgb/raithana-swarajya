-- Replace the abandoned order workflow with direct producer-consumer messaging.
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TYPE IF EXISTS public.order_status;

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

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_conversations_consumer ON public.conversations(consumer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_producer ON public.conversations(producer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations: participants read" ON public.conversations;
CREATE POLICY "conversations: participants read" ON public.conversations FOR SELECT TO authenticated
USING (auth.uid() = consumer_id OR auth.uid() = producer_id);

DROP POLICY IF EXISTS "conversations: consumer starts" ON public.conversations;
CREATE POLICY "conversations: consumer starts" ON public.conversations FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = consumer_id
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_role = 'consumer'
    )
    AND EXISTS (
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
WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.conversations
        WHERE conversations.id = messages.conversation_id
          AND auth.uid() IN (conversations.producer_id, conversations.consumer_id)
    )
);

GRANT SELECT, INSERT ON public.conversations, public.messages TO authenticated;
GRANT ALL ON public.conversations, public.messages TO service_role;
