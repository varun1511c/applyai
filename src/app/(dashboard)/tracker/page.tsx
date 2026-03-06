import { createClient } from "@/lib/supabase/server";
import { ApplicationTracker } from "@/components/tracker/ApplicationTracker";

export default async function TrackerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, resumes(name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, name")
    .eq("user_id", user!.id);

  return (
    <ApplicationTracker
      initialApplications={applications ?? []}
      resumes={resumes ?? []}
    />
  );
}
