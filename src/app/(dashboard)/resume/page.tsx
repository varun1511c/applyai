import Link from "next/link";
import { Plus, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function ResumePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, name, last_ats_score, updated_at, is_default")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Resumes</h2>
          <p className="text-muted-foreground">
            Upload, edit, and optimize your resumes for every job.
          </p>
        </div>
        <Button asChild>
          <Link href="/resume/new">
            <Plus className="mr-2 h-4 w-4" />
            New Resume
          </Link>
        </Button>
      </div>

      {!resumes || resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-blue-50 p-4 mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
            <p className="text-muted-foreground max-w-sm text-sm mb-4">
              Upload your existing resume or create one from scratch. The AI will
              help you optimize it for any job description.
            </p>
            <Button asChild>
              <Link href="/resume/new">
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Link key={resume.id} href={`/resume/${resume.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{resume.name}</p>
                        {resume.is_default && (
                          <span className="text-xs text-blue-600 font-medium">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    {resume.last_ats_score != null && (
                      <div
                        className={`text-sm font-bold px-2 py-1 rounded-full ${
                          resume.last_ats_score >= 80
                            ? "text-green-700 bg-green-100"
                            : resume.last_ats_score >= 60
                            ? "text-amber-700 bg-amber-100"
                            : "text-red-700 bg-red-100"
                        }`}
                      >
                        {resume.last_ats_score}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Updated{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(resume.updated_at))}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Add new card */}
          <Link href="/resume/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  Add resume
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
