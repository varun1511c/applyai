"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    job_title: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    weekly_goal: 5,
  });

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          job_title: data.job_title ?? "",
          location: data.location ?? "",
          linkedin_url: data.linkedin_url ?? "",
          github_url: data.github_url ?? "",
          portfolio_url: data.portfolio_url ?? "",
          weekly_goal: data.weekly_goal ?? 5,
        });
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Profile saved!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            This information is used by the AI to personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="Alex Johnson"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_title">Target Job Title</Label>
              <Input
                id="job_title"
                value={profile.job_title}
                onChange={(e) =>
                  setProfile({ ...profile, job_title: e.target.value })
                }
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) =>
                setProfile({ ...profile, location: e.target.value })
              }
              placeholder="San Francisco, CA (or Remote)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={profile.linkedin_url}
              onChange={(e) =>
                setProfile({ ...profile, linkedin_url: e.target.value })
              }
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input
                id="github"
                value={profile.github_url}
                onChange={(e) =>
                  setProfile({ ...profile, github_url: e.target.value })
                }
                placeholder="https://github.com/yourname"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio">Portfolio URL</Label>
              <Input
                id="portfolio"
                value={profile.portfolio_url}
                onChange={(e) =>
                  setProfile({ ...profile, portfolio_url: e.target.value })
                }
                placeholder="https://yoursite.dev"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly_goal">Weekly Application Goal</Label>
            <Input
              id="weekly_goal"
              type="number"
              min={1}
              max={100}
              value={profile.weekly_goal}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  weekly_goal: parseInt(e.target.value) || 5,
                })
              }
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              How many applications per week do you want to target?
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Get free API keys for job search. These are stored only in your{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code>{" "}
            file — never shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <p className="font-medium">Required to get started:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                •{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Gemini API Key
                </a>{" "}
                — Free, 1,500 req/day
              </li>
              <li>
                •{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Supabase Project
                </a>{" "}
                — Free tier
              </li>
              <li>
                •{" "}
                <a
                  href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  JSearch RapidAPI Key
                </a>{" "}
                — 500 free searches/month
              </li>
              <li>
                •{" "}
                <a
                  href="https://developer.adzuna.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Adzuna API Key
                </a>{" "}
                — Free, unlimited
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
