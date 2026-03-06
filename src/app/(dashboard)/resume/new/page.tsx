"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Loader2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function NewResumePage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("My Resume");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let pdfUrl: string | null = null;
    let parsedData: Record<string, unknown> | null = null;

    // Step 1: Upload PDF to Supabase Storage
    if (file) {
      setStatus("Uploading PDF...");
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, file, { contentType: "application/pdf" });

      if (uploadError) {
        toast.error("Failed to upload PDF: " + uploadError.message);
        setLoading(false);
        setStatus("");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(path);
      pdfUrl = urlData.publicUrl;

      // Step 2: AI parse the PDF
      setStatus("AI is reading your resume...");
      try {
        const formData = new FormData();
        formData.append("file", file);
        const parseRes = await fetch("/api/resume/parse", {
          method: "POST",
          body: formData,
        });
        if (parseRes.ok) {
          parsedData = await parseRes.json();
          // Auto-update resume name from parsed contact
          if (
            name === "My Resume" &&
            parsedData?.contact &&
            typeof parsedData.contact === "object" &&
            (parsedData.contact as Record<string, string>).name
          ) {
            setName((parsedData.contact as Record<string, string>).name + " Resume");
          }
          toast.success("AI parsed your resume successfully!");
        } else {
          const err = await parseRes.json().catch(() => ({}));
          toast.warning((err as Record<string, string>).error ?? "AI parsing skipped — fill in details manually.");
        }
      } catch {
        toast.warning("AI parsing skipped — fill in details manually.");
      }
    }

    // Step 3: Create resume record in DB
    setStatus("Creating resume...");
    const { data, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        name,
        original_pdf_url: pdfUrl,
        is_default: false,
        ...(parsedData
          ? {
              contact: parsedData.contact ?? null,
              summary: parsedData.summary ?? null,
              experience: parsedData.experience ?? [],
              education: parsedData.education ?? [],
              skills: parsedData.skills ?? [],
              certifications: parsedData.certifications ?? [],
              projects: parsedData.projects ?? [],
            }
          : {}),
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to create resume: " + error.message);
    } else {
      toast.success("Resume created!");
      router.push(`/resume/${data.id}`);
    }
    setLoading(false);
    setStatus("");
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">New Resume</h2>
        <p className="text-muted-foreground">
          Upload an existing PDF or start fresh.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resume Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Resume Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Software Engineer Resume"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Upload PDF (optional)</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  file
                    ? "border-blue-500 bg-blue-950/20"
                    : "border-slate-700 hover:border-blue-500"
                }`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <FileText className="h-5 w-5" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      Drop your PDF here or click to browse
                    </p>
                  </div>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div className="flex items-start gap-2 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 mt-0.5 text-blue-400 shrink-0" />
                <p>
                  AI will automatically parse your PDF and pre-fill the editor with your experience, education, and skills.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {status || "Creating..."}
              </>
            ) : (
              "Create Resume"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
