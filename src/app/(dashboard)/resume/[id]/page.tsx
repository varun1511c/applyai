import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResumeEditor } from "@/components/resume/ResumeEditor";

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!resume) notFound();

  return <ResumeEditor resume={resume} />;
}
