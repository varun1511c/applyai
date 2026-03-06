import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { resumeId, jobDescription, jobTitle, company } = await request.json();

  const { data: resume } = await supabase
    .from("resumes")
    .select("summary, experience, education, skills, name")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (!resume) {
    return new Response(JSON.stringify({ error: "Resume not found" }), { status: 404 });
  }

  const prompt = `You are an expert resume writer and ATS optimization specialist.

TASK: Tailor the resume below to better match this specific job description while keeping it honest and realistic.

RESUME:
${JSON.stringify(resume, null, 2)}

JOB: ${jobTitle ?? "Not specified"} at ${company ?? "Not specified"}

JOB DESCRIPTION:
${jobDescription}

STRICT RULES:
1. NEVER invent experience, projects, or achievements that don't exist in the original resume.
2. ONLY reframe and reword existing experience using language from the job description.
3. Insert missing keywords naturally into existing bullet points where they honestly apply.
4. Reorder skills to prioritize those mentioned in the JD.
5. Update the professional summary to mirror the JD's language for the ideal candidate.
6. Quantify achievements where the data is already implied (e.g., "improved performance" → "improved performance by optimizing queries").

OUTPUT FORMAT:
For each change, provide:
## [Section Name]
**Original:** [original text]
**Optimized:** [new text]
**Why:** [brief reason - what keyword/requirement this addresses]

Then at the end, add:
## Keywords Added
[list of keywords successfully incorporated]

## Still Missing
[list of important JD keywords that couldn't be added without fabrication]

## New ATS Score Estimate
[your estimate of the new score out of 100]`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        stream: true,
        messages: [
          { role: "system", content: "You are an expert resume writer. Follow the instructions exactly." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      throw new Error(errorText);
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
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Optimize error:", error);
    return new Response(
      JSON.stringify({ error: "Optimization failed. Check your GROQ_API_KEY." }),
      { status: 500 }
    );
  }
}
