import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { resumeId, jobDescription } = await request.json();

  if (!resumeId || !jobDescription) {
    return NextResponse.json(
      { error: "resumeId and jobDescription are required" },
      { status: 400 }
    );
  }

  const { data: resume, error: resumeError } = await supabase
    .from("resumes")
    .select("summary, experience, education, skills, certifications, projects, contact")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .single();

  if (resumeError || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const resumeText = JSON.stringify(resume, null, 2);

  const prompt = `You are an ATS (Applicant Tracking System) expert. Score this resume against the job description.

RESUME DATA:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Scoring rules:
- keyword_match: max 40 pts. Count how many required/preferred keywords from the JD appear in the resume. Be precise.
- section_completeness: max 20 pts. Award based on presence of: summary, experience, education, skills, contact info.
- formatting: max 20 pts. Award based on JSON structure completeness — dates, bullet points, quantified achievements.
- relevance: max 20 pts. How well does the candidate's experience level and domain match what the JD asks for?

For missing keywords, list the important technical skills, tools, and requirements from the JD that are NOT in the resume.
For matched keywords, list the ones that ARE present.

Be accurate and honest, not flattering. The goal is to help the user improve.

Return ONLY valid JSON in this exact format:
{
  "overall_score": <number 0-100>,
  "breakdown": {
    "keyword_match": { "score": <number>, "max": 40, "matched": [<strings>], "missing": [<strings>] },
    "section_completeness": { "score": <number>, "max": 20 },
    "formatting": { "score": <number>, "max": 20 },
    "relevance": { "score": <number>, "max": 20 }
  },
  "top_3_recommendations": [<3 strings>]
}`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are an ATS scoring expert. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      throw new Error(errorText);
    }

    const result = await groqRes.json();
    const data = JSON.parse(result.choices[0].message.content);

    // Store in DB
    await supabase
      .from("resumes")
      .update({ last_ats_score: data.overall_score })
      .eq("id", resumeId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("ATS score error:", error);
    return NextResponse.json(
      { error: "Failed to compute ATS score. Check your GROQ_API_KEY." },
      { status: 500 }
    );
  }
}
