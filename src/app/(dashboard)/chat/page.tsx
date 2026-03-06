import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, job_title")
    .eq("id", user!.id)
    .single();

  const { data: conversations } = await supabase
    .from("chat_conversations")
    .select("id, title, created_at")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <ChatInterface
      profile={profile}
      conversations={conversations ?? []}
    />
  );
}
