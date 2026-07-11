import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { marketplaceApi } from "../../lib/api";

export default function MessagingDrawer({ open, onClose, initialConversationId = null }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const selectedIdRef = useRef(selectedId);

  // Sync structural ref state
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Smooth scroll helper execution anchor
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Auto-scroll anchor timeline hook
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages]);

  const loadMessages = useCallback(async (conversationId, quiet = false) => {
    if (!conversationId) return;
    if (!quiet) setLoading(true);
    try {
      const nextMessages = await marketplaceApi.listMessages(conversationId);
      setMessages(Array.isArray(nextMessages) ? nextMessages : []);
      setError("");
    } catch (err) {
      setMessages([]);
      if (!quiet) setError(err.message || "Unable to load messages.");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  // Conversations Inbox Sync Engine
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);

    marketplaceApi.listConversations()
      .then((items) => {
        if (!active) return;
        const normalizedItems = Array.isArray(items) ? items : [];
        setConversations(normalizedItems);
        
        const currentSelectedId = selectedIdRef.current;
        const hasSelected = normalizedItems.some((item) => item.id === currentSelectedId);
        const nextId = initialConversationId || (hasSelected ? currentSelectedId : normalizedItems[0]?.id) || null;
        
        setSelectedId(nextId);
        if (nextId) {
          void loadMessages(nextId).then(() => {
            if (active) scrollToBottom("auto");
          });
        } else {
          setMessages([]);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load conversations.");
          setMessages([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, initialConversationId, loadMessages]);

  // 5-Second Real-Time Network Polling Engine
  useEffect(() => {
    if (!open || !selectedId) return;
    const timer = window.setInterval(() => void loadMessages(selectedId, true), 5000);
    return () => window.clearInterval(timer);
  }, [open, selectedId, loadMessages]);

  async function selectConversation(id) {
    setSelectedId(id);
    await loadMessages(id);
    setTimeout(() => scrollToBottom("auto"), 50);
  }

  async function send(event) {
    event.preventDefault();
    const text = body.trim();
    if (!text || !selectedId) return;
    
    setSending(true); 
    setError("");
    try {
      const message = await marketplaceApi.sendMessage(selectedId, text);
      setMessages((current) => [...current, message]);
      setBody("");
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) {
      setError(err.message || "Unable to send this message.");
    } finally {
      setSending(false);
    }
  }

  const selected = conversations.find((item) => item.id === selectedId);

  return (
    <>
      {/* Background Mask */}
      <div 
        onClick={onClose} 
        className={`fixed inset-0 z-30 bg-slate-950/50 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} 
      />
      
      {/* Drawer Container Panel */}
      <aside 
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-4xl transform flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-950 ${open ? "translate-x-0" : "translate-x-full"}`} 
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Marketplace messages</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discuss quantity, price, pickup, and delivery directly.</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-xl px-3 py-1.5 text-2xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors" 
            aria-label="Close messages"
          >
            ×
          </button>
        </header>

        <div className="grid min-h-0 flex-1 md:grid-cols-[280px_1fr]">
          {/* Left Navigation: Inbox Sidebar */}
          <nav className="overflow-y-auto border-b border-slate-200 p-3 dark:border-slate-800 md:border-b-0 md:border-r bg-slate-50/20 dark:bg-slate-950">
            {!conversations.length && !loading && (
              <p className="p-5 text-center text-sm text-slate-400 italic">No direct inquiries open yet.</p>
            )}
            {conversations.map((conversation) => {
              const isActive = selectedId === conversation.id;
              return (
                <button 
                  key={conversation.id} 
                  onClick={() => selectConversation(conversation.id)} 
                  className={`mb-2 w-full rounded-xl p-3 text-left transition-all border ${
                    isActive 
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60" 
                      : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <p className={`truncate font-bold ${isActive ? "text-[#00B761]" : "text-slate-800 dark:text-slate-200"}`}>
                    {conversation.other_party_name || "Marketplace member"}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">{conversation.crop_name}</p>
                </button>
              );
            })}
          </nav>

          {/* Right Navigation: Active Chat Frame Stream */}
          <section className="flex min-h-0 flex-col bg-white dark:bg-slate-950">
            {selected ? (
              <>
                <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-800 bg-slate-50/30 dark:bg-zinc-900/20">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{selected.other_party_name}</p>
                  <p className="text-xs text-slate-400">Regarding: {selected.crop_name}</p>
                </div>
                
                {/* Chat Feed Grid container */}
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-5 dark:bg-slate-900/20">
                  {loading && messages.length === 0 && (
                    <p className="text-center text-xs text-slate-400">Loading messages…</p>
                  )}
                  {!loading && !messages.length && (
                    <p className="text-center text-sm text-slate-400 italic py-6">
                      Start the conversation. Be clear about pickup terms and locations.
                    </p>
                  )}
                  {messages.map((message) => {
                    const mine = message.sender_id === user?.id;
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                          mine 
                            ? "bg-[#00B761] text-white rounded-br-none font-medium" 
                            : "border border-slate-200 bg-white text-slate-900 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none"
                        }`}>
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
                          <p className={`mt-1 text-[9px] font-medium text-right ${mine ? "text-emerald-100" : "text-slate-400"}`}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Text Form Input Field Footer */}
                <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/60">
                  <input 
                    value={body} 
                    onChange={(event) => setBody(event.target.value)} 
                    maxLength={2000} 
                    placeholder="Write a message… (discuss terms, pricing, or location)" 
                    className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#00B761] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 transition-all" 
                  />
                  <button 
                    disabled={sending || !body.trim()} 
                    className="rounded-xl bg-[#FF7A00] hover:bg-orange-600 px-5 py-3 font-bold text-sm text-white disabled:opacity-50 shadow-sm transition-all"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-400 italic">
                Select a conversation from the sidebar panel to begin negotiating deals directly.
              </div>
            )}
            
            {error && (
              <p className="border-t border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                ⚠️ {error}
              </p>
            )}
          </section>
        </div>
      </aside>
    </>
  );
}