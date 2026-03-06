import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { JobListing } from "@/types/jobs";

export const runtime = "nodejs";

// GET — list all saved jobs for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: data ?? [] });
}

// POST — save a job
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const job: JobListing = await request.json();

  const { data, error } = await supabase
    .from("saved_jobs")
    .upsert({
      user_id: user.id,
      external_id: job.id,
      platform: job.source,
      job_title: job.title,
      company: job.company,
      location: job.location,
      job_url: job.url,
      description: job.description,
      salary_min: job.salary_min ?? null,
      salary_max: job.salary_max ?? null,
      posted_at: job.date_posted ? new Date(job.date_posted).toISOString() : null,
      raw_data: job,
    }, { onConflict: "user_id,external_id,platform" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ saved: data });
}

// DELETE — unsave by external_id
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { external_id } = await request.json();

  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", user.id)
    .eq("external_id", external_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
