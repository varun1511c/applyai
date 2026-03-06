"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface OptimizePanelProps {
  resume: {
    id: string;
    name: string;
  };
}

interface ATSResult {
  overall_score: number;
  breakdown: {
    keyword_match: { score: number; max: number; matched: string[]; missing: string[] };
    section_completeness: { score: number; max: number };
    formatting: { score: number; max: number };
    relevance: { score: number; max: number };
  };
  top_3_recommendations: string[];
}

export function OptimizePanel({ resume }: OptimizePanelProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<string>("");

  const handleATSScore = async () => {
    if (!jd.trim()) {
      toast.error("Please paste a job description first.");
      return;
    }
    setLoading(true);
    setAtsResult(null);
    try {
      const res = await fetch("/api/resume/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, jobDescription: jd }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAtsResult(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!jd.trim()) {
      toast.error("Please paste a job description first.");
      return;
    }
    setOptimizing(true);
    setOptimizeResult("");
    try {
      const res = await fetch("/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          jobDescription: jd,
          jobTitle,
          company,
        }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setOptimizeResult(text);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setOptimizing(false);
    }
  };

  const scoreColor = atsResult
    ? atsResult.overall_score >= 80
      ? "text-green-600"
      : atsResult.overall_score >= 60
      ? "text-amber-600"
      : "text-red-600"
    : "";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Optimize Resume</h2>
        <p className="text-muted-foreground">
          Tailoring <span className="font-medium text-foreground">{resume.name}</span> to
          a specific job description using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Job Description Input */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Job Title</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Company</Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Google"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Job Description *</Label>
                <Textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="min-h-[300px] font-mono text-xs"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleATSScore}
                  disabled={loading || !jd.trim()}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Check ATS Score
                </Button>
                <Button
                  onClick={handleOptimize}
                  disabled={optimizing || !jd.trim()}
                >
                  {optimizing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Optimize Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {/* ATS Score */}
          {atsResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  ATS Score
                  <span className={`text-3xl font-black ${scoreColor}`}>
                    {atsResult.overall_score}/100
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {Object.entries(atsResult.breakdown).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium">
                        {(val as { score: number; max: number }).score}/
                        {(val as { score: number; max: number }).max}
                      </span>
                    </div>
                  ))}
                </div>

                {atsResult.breakdown.keyword_match.missing.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Missing Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {atsResult.breakdown.keyword_match.missing.map((kw) => (
                        <Badge key={kw} variant="outline" className="text-red-600 border-red-200">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {atsResult.top_3_recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {atsResult.top_3_recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <ArrowRight className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Optimization Result */}
          {(optimizing || optimizeResult) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  AI Optimization Suggestions
                  {optimizing && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap font-mono bg-slate-900 text-slate-200 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  {optimizeResult || "Generating..."}
                </div>
              </CardContent>
            </Card>
          )}

          {!atsResult && !optimizing && !optimizeResult && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Sparkles className="h-8 w-8 text-blue-400 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Paste a job description on the left, then check your ATS score or
                  let AI optimize your resume.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
