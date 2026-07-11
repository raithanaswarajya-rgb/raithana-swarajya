import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { syncProfile } from "../lib/api";

/**
 * Handles Supabase Auth flows with profile sync.
 */
export function useSupabaseAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Sign up a new user and sync their profile to the backend.
   * Returns { success: true } on signup confirmation sent,
   * or { success: false, error } on failure.
   */
  async function signUp({ email, password, fullName, language, role }) {
    setLoading(true);
    setError(null);

    try {
      const emailRedirectTo = import.meta.env.VITE_EMAIL_REDIRECT_TO || "http://10.20.7.40:5173/auth";

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // This metadata is read by the DB trigger handle_new_user_signup()
          data: {
            full_name: fullName,
            language,
            user_role: role,
            role,
          },
          emailRedirectTo,
        },
      });

      if (signUpError) throw signUpError;

      // Optimistically sync profile to FastAPI backend too
      if (data.user) {
        try {
          await syncProfile({
            supabase_uuid: data.user.id,
            full_name: fullName,
            language,
            role,
          });
        } catch (syncErr) {
          // Non-fatal — the DB trigger already handled it
          console.warn("Profile sync to backend failed:", syncErr.message);
        }
      }

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  /**
   * Sign in an existing user.
   */
  async function signIn({ email, password }) {
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      return { success: true, session: data.session };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { signUp, signIn, loading, error, setError };
}
