"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Send,
  Plus,
  Loader2,
  Bot,
  User,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, formatRelativeDate } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface ChatInterfaceProps {
  profile?: { full_name?: string | null; job_title?: string | null } | null;
  conversations: Conversation[];
}

const SUGGESTED_PROMPTS = [
  "Help me optimize my resume for a React developer role",
  "Write a cover letter for a product manager position",
  "What are the most important skills for a data scientist?",
  "How should I answer 'Tell me about yourself' in an interview?",
  "What salary should I ask for as a senior software engineer?",
];

export function ChatInterface({ profile, conversations: initialConvos }: ChatInterfaceProps) {
  const supabase = createClient();
  const [conversations, setConversations] = useState(initialConvos);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createConversation = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title: "New Conversation" })
      .select("id, title, created_at")
      .single();

    if (data) {
      setConversations([data, ...conversations]);
      setActiveConversationId(data.id);
      setMessages([]);
    }
    return data?.id ?? null;
  };

  const loadConversation = async (convId: string) => {
    setActiveConversationId(convId);
    const { data } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
  };

  const sendMessage = async (text?: string) => {
    const msgText = text ?? input.trim();
    if (!msgText || loading) return;

    setInput("");
    setLoading(true);

    let convId = activeConversationId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) {
        setLoading(false);
        return;
      }
    }

    const userMessage: Message = { role: "user", content: msgText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "user",
      content: msgText,
    });

    // Update conversation title on first message
    if (messages.length === 0) {
      const title = msgText.slice(0, 60) + (msgText.length > 60 ? "…" : "");
      await supabase
        .from("chat_conversations")
        .update({ title })
        .eq("id", convId);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title } : c))
      );
    }

    // Stream AI response
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convId,
          message: msgText,
          history: updatedMessages.slice(-10),
          profile,
        }),
      });

      // Handle non-OK responses before touching the stream
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "AI request failed" }));
        toast.error(data.error ?? "AI request failed");
        setLoading(false);
        return;
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }

      // Save assistant message
      if (assistantText) {
        await supabase.from("chat_messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: assistantText,
        });
      }
    } catch (err) {
      toast.error("Failed to get response: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      {/* Sidebar */}
      <div className="flex w-64 shrink-0 flex-col border-r border-slate-800">
        <div className="border-b border-slate-800 p-3">
          <button
            onClick={() => {
              setActiveConversationId(null);
              setMessages([]);
              createConversation();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
          >
            <Plus className="h-4 w-4" /> New Chat
          </button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <p className="px-2 py-3 text-xs text-slate-600">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                  conv.id === activeConversationId
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : "border-transparent text-slate-400 hover:border-slate-700/60 hover:bg-slate-800/60 hover:text-slate-200"
                )}
              >
                <span className="flex items-center gap-1.5 truncate font-medium">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </span>
                <span className="pl-5 text-xs text-slate-600">
                  {formatRelativeDate(conv.created_at)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                <Sparkles className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Hi{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}! I&apos;m your AI career co-pilot.
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                  I can help optimize your resume, write cover letters, prepare for interviews, and give career advice.
                </p>
              </div>
              <div className="grid w-full max-w-lg gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-4 py-3 text-left text-sm text-slate-300 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "border border-slate-700/60 bg-slate-800/80 text-slate-100"
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700">
                      <User className="h-4 w-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-4">
          <div className="mx-auto flex max-w-3xl gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything about your job search... (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="min-h-[52px] max-h-[200px] flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
