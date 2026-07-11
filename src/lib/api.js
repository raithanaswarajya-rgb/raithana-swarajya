import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Utility function to handle network requests requiring bearer authentication.
 */
async function authenticatedFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Your session has expired. Please log in again.");
  }

  // Handle headers safely
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.access_token}`,
  };

  // Centralize body stringification if it's a plain object
  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  } else if (body && typeof body === "string") {
    // If body is already passed as a JSON string, ensure header is present
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    const bodyText = await response.json().catch(() => ({}));
    throw new Error(bodyText.detail || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

/**
 * Syncs a user profile to the FastAPI backend after signup.
 * @param {object} payload
 * @param {string} payload.supabase_uuid
 * @param {string} payload.full_name
 * @param {string} [payload.phone]
 * @param {"kn"|"en"} payload.language
 * @param {"producer"|"consumer"} payload.role
 */
export async function syncProfile(payload) {
  const res = await fetch(`${BASE_URL}/v1/profile/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Profile sync failed");
  }

  return res.json();
}

export const marketplaceApi = {
  // Fetch active products
  listProducts: ({ mine = false } = {}) =>
    authenticatedFetch(`/v1/marketplace/products${mine ? "?mine=true" : ""}`),

  // Create a new crop listing (pass plain objects directly)
  createProduct: (product) =>
    authenticatedFetch("/v1/marketplace/products", {
      method: "POST",
      body: product,
    }),

  // Update specific values (Price, unit changes)
  updateProduct: (productId, changes) =>
    authenticatedFetch(`/v1/marketplace/products/${productId}`, {
      method: "PATCH",
      body: changes,
    }),

  // Conversations Management
  listConversations: () => 
    authenticatedFetch("/v1/marketplace/conversations"),

  startConversation: (productId) =>
    authenticatedFetch("/v1/marketplace/conversations", {
      method: "POST",
      body: { product_id: productId },
    }),

  listMessages: (conversationId) =>
    authenticatedFetch(`/v1/marketplace/conversations/${conversationId}/messages`),

  sendMessage: (conversationId, body) =>
    authenticatedFetch(`/v1/marketplace/conversations/${conversationId}/messages`, {
      method: "POST",
      body: { body },
    }),

  // Native Supabase Storage engine upload handling
  uploadProductImage: async (file) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Your session has expired. Please log in again.");

    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
    
    if (error) throw new Error(`Image upload failed: ${error.message}`);

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return data.publicUrl;
  },
};