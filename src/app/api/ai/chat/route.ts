import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { message, history, profile } = await request.json();

  const systemPrompt = `You are an expert AI career co-pilot named "ApplyAI Assistant". You help job seekers with:
- Resume optimization and ATS scoring
- Cover letter writing
- Interview preparation
- Career advice and job search strategy
- Salary negotiation tips

${profile?.full_name ? `The user's name is ${profile.full_name}.` : ""}
${profile?.job_title ? `They are targeting roles as a ${profile.job_title}.` : ""}

Today's date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

Keep responses helpful, specific, and actionable. Use bullet points for lists. Be encouraging but honest.`;

  // Build conversation messages in OpenAI format
  const pastMessages = (history ?? [])
    .slice(0, -1)
    .map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...pastMessages,
    { role: "user", content: message },
  ];

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        stream: true,
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error("Groq API error:", errorText);
      return new Response(
        JSON.stringify({ error: `AI request failed: ${errorText}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse OpenAI-format SSE and forward text chunks
    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) controller.enqueue(new TextEncoder().encode(text));
            } catch {
              // skip malformed chunks
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: `AI request failed: ${detail}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
