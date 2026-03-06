import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Extract text from PDF using pdf-parse
  let pdfText = "";
  try {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(buffer);
    pdfText = parsed.text;
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json({ error: "Failed to read PDF. Make sure it is a text-based PDF, not a scanned image." }, { status: 422 });
  }

  if (!pdfText.trim()) {
    return NextResponse.json({ error: "Could not extract text from PDF. It may be a scanned image." }, { status: 422 });
  }

  // Use Groq to structure the extracted text into resume JSON
  const prompt = `Extract all resume information from the text below and return it as structured JSON.

RESUME TEXT:
${pdfText.slice(0, 8000)}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "contact": {
    "name": "",
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "title": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "bullets": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "graduationDate": "",
      "gpa": ""
    }
  ],
  "skills": [],
  "certifications": [],
  "projects": [
    {
      "name": "",
      "description": "",
      "tech": "",
      "url": ""
    }
  ]
}

Rules:
- Extract all available information accurately
- For missing fields use empty string "" or empty array []
- Skills must be individual items in the array, not comma-separated strings
- Bullets must be the actual bullet points/responsibilities from each job, as an array of strings
- Dates should be readable like "Jan 2022" or "2022" or "Present"
- If no projects or certifications exist, return empty arrays`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a resume parser. Extract structured data from resume text and return valid JSON only.",
          },
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI parse error:", error);
    return NextResponse.json({ error: "AI parsing failed. Your resume was uploaded but could not be auto-filled." }, { status: 500 });
  }
}
