"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Save, Sparkles, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

interface ResumeEditorProps {
  resume: {
    id: string;
    name: string;
    summary?: string;
    contact?: Record<string, string>;
    experience?: ExperienceItem[];
    education?: EducationItem[];
    skills?: string[];
    projects?: ProjectItem[];
    certifications?: string[];
  };
}

interface ExperienceItem {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
}

interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  graduationDate?: string;
  gpa?: string;
}

interface ProjectItem {
  name: string;
  description: string;
  tech?: string;
  url?: string;
}

export function ResumeEditor({ resume }: ResumeEditorProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    name: resume.name,
    summary: resume.summary ?? "",
    contact: resume.contact ?? { name: "", email: "", phone: "", location: "" },
    experience: (resume.experience ?? []) as ExperienceItem[],
    education: (resume.education ?? []) as EducationItem[],
    skills: (resume.skills ?? []) as string[],
  });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("resumes")
      .update({
        name: data.name,
        summary: data.summary,
        contact: data.contact,
        experience: data.experience,
        education: data.education,
        skills: data.skills,
      })
      .eq("id", resume.id);

    if (error) toast.error("Save failed: " + error.message);
    else toast.success("Resume saved!");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="text-2xl font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
          />
          <p className="text-muted-foreground text-sm mt-1">
            Edit your resume below. Changes are saved to the database.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/resume/generate-pdf/${resume.id}`} download>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/resume/${resume.id}/optimize`}>
              <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
              Optimize for Job
            </Link>
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {(["name", "email", "phone", "location"] as const).map((field) => (
            <div key={field} className="space-y-1">
              <Label className="capitalize">{field}</Label>
              <Input
                value={(data.contact as Record<string, string>)[field] ?? ""}
                onChange={(e) =>
                  setData({
                    ...data,
                    contact: { ...data.contact, [field]: e.target.value },
                  })
                }
                placeholder={
                  field === "email"
                    ? "you@example.com"
                    : field === "phone"
                    ? "+1 (555) 000-0000"
                    : field === "location"
                    ? "City, State"
                    : "Your Name"
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.summary}
            onChange={(e) => setData({ ...data, summary: e.target.value })}
            placeholder="Results-driven software engineer with 5+ years building..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Work Experience</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setData({
                ...data,
                experience: [
                  ...data.experience,
                  {
                    company: "",
                    title: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    bullets: [""],
                  },
                ],
              })
            }
          >
            + Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.experience.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No experience added yet. Click &quot;+ Add&quot; to get started.
            </p>
          )}
          {data.experience.map((exp, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...data.experience];
                      updated[idx] = { ...exp, company: e.target.value };
                      setData({ ...data, experience: updated });
                    }}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Job Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => {
                      const updated = [...data.experience];
                      updated[idx] = { ...exp, title: e.target.value };
                      setData({ ...data, experience: updated });
                    }}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Start Date</Label>
                  <Input
                    value={exp.startDate}
                    onChange={(e) => {
                      const updated = [...data.experience];
                      updated[idx] = { ...exp, startDate: e.target.value };
                      setData({ ...data, experience: updated });
                    }}
                    placeholder="Jan 2022"
                  />
                </div>
                <div className="space-y-1">
                  <Label>End Date</Label>
                  <Input
                    value={exp.endDate ?? ""}
                    onChange={(e) => {
                      const updated = [...data.experience];
                      updated[idx] = { ...exp, endDate: e.target.value };
                      setData({ ...data, experience: updated });
                    }}
                    placeholder="Present"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Bullet Points</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      const updated = [...data.experience];
                      updated[idx] = {
                        ...exp,
                        bullets: [...exp.bullets, ""],
                      };
                      setData({ ...data, experience: updated });
                    }}
                  >
                    + Add bullet
                  </Button>
                </div>
                {exp.bullets.map((bullet, bIdx) => (
                  <Input
                    key={bIdx}
                    value={bullet}
                    onChange={(e) => {
                      const updated = [...data.experience];
                      const updatedBullets = [...exp.bullets];
                      updatedBullets[bIdx] = e.target.value;
                      updated[idx] = { ...exp, bullets: updatedBullets };
                      setData({ ...data, experience: updated });
                    }}
                    placeholder="• Achieved X by doing Y, resulting in Z% improvement"
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive text-xs"
                onClick={() => {
                  const updated = data.experience.filter((_, i) => i !== idx);
                  setData({ ...data, experience: updated });
                }}
              >
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.skills.join(", ")}
            onChange={(e) =>
              setData({
                ...data,
                skills: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Python, TypeScript, React, AWS, Docker, SQL..."
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate skills with commas.
          </p>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Resume
      </Button>
    </div>
  );
}
