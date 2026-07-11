-- ═══════════════════════════════════════════════════════════════
-- Raithana Swarajya — Initial Schema
-- Migration: 001_initial_schema.sql
-- Run via: supabase db push  OR  paste into SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. ENUM types ─────────────────────────────────────────────
CREATE TYPE public.user_role AS ENUM ('producer', 'consumer');
CREATE TYPE public.app_language AS ENUM ('kn', 'en', 'hi');

-- ── 2. PROFILES TABLE ─────────────────────────────────────────
CREATE TABLE public.profiles (
    id          UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    phone       TEXT,
    language    app_language  NOT NULL DEFAULT 'en',
    user_role   user_role     NOT NULL DEFAULT 'consumer',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. AUTO-SYNC TRIGGER ──────────────────────────────────────
-- Seeds profiles from signup metadata: { full_name, language, role }
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_full_name  TEXT;
    v_language   app_language;
    v_role       user_role;
BEGIN
    v_full_name := NEW.raw_user_meta_data->>'full_name';

    v_language := COALESCE(
        (NEW.raw_user_meta_data->>'language')::app_language,
        'en'
    );

    v_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'consumer'
    );

    INSERT INTO public.profiles (id, full_name, language, user_role)
    VALUES (NEW.id, v_full_name, v_language, v_role)
    ON CONFLICT (id) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            language  = EXCLUDED.language,
            user_role = EXCLUDED.user_role;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ── 4. ROW LEVEL SECURITY ─────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles: insert own"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ── 5. INDEXES ────────────────────────────────────────────────
CREATE INDEX idx_profiles_user_role ON public.profiles(user_role);
CREATE INDEX idx_profiles_language ON public.profiles(language);
