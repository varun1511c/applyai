"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Download,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Application {
  id: string;
  job_title: string;
  company: string;
  job_url?: string | null;
  date_applied?: string | null;
  status: string;
  resume_id?: string | null;
  resume_name?: string | null;
  notes?: string | null;
  platform?: string | null;
  resumes?: { name: string } | null;
}

interface Resume {
  id: string;
  name: string;
}

interface ApplicationTrackerProps {
  initialApplications: Application[];
  resumes: Resume[];
}

const STATUSES = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

export function ApplicationTracker({
  initialApplications,
  resumes,
}: ApplicationTrackerProps) {
  const supabase = createClient();
  const [applications, setApplications] = useState(initialApplications);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newApp, setNewApp] = useState({
    job_title: "",
    company: "",
    job_url: "",
    date_applied: new Date().toISOString().split("T")[0],
    status: "applied",
    resume_id: "",
    notes: "",
    platform: "",
  });

  const filtered = applications.filter((app) => {
    const matchSearch =
      !search ||
      app.job_title.toLowerCase().includes(search.toLowerCase()) ||
      app.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const resumeName = resumes.find((r) => r.id === newApp.resume_id)?.name;

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        job_title: newApp.job_title,
        company: newApp.company,
        job_url: newApp.job_url || null,
        date_applied: newApp.date_applied || null,
        status: newApp.status,
        resume_id: newApp.resume_id || null,
        resume_name: resumeName ?? null,
        notes: newApp.notes || null,
        platform: newApp.platform || null,
      })
      .select("*")
      .single();

    if (error) {
      toast.error("Failed to add: " + error.message);
    } else {
      setApplications([data, ...applications]);
      toast.success("Application added!");
      setShowAddDialog(false);
      setNewApp({
        job_title: "",
        company: "",
        job_url: "",
        date_applied: new Date().toISOString().split("T")[0],
        status: "applied",
        resume_id: "",
        notes: "",
        platform: "",
      });
    }
    setSaving(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Update failed");
    } else {
      setApplications(applications.map((a) => (a.id === id ? { ...a, status } : a)));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
    } else {
      setApplications(applications.filter((a) => a.id !== id));
      toast.success("Removed");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Job Title",
      "Company",
      "Job URL",
      "Date Applied",
      "Status",
      "Resume Used",
      "Platform",
      "Notes",
    ];
    const rows = filtered.map((app) => [
      app.job_title,
      app.company,
      app.job_url ?? "",
      app.date_applied ?? "",
      STATUS_CONFIG[app.status]?.label ?? app.status,
      app.resume_name ?? app.resumes?.name ?? "",
      app.platform ?? "",
      app.notes ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "applications.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Job Tracker</h2>
          <p className="text-muted-foreground">
            {applications.length} application
            {applications.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Job Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Company
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date Applied
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Resume Used
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Notes
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-16 text-muted-foreground"
                  >
                    {applications.length === 0
                      ? "No applications yet. Click \"Add Application\" to start tracking!"
                      : "No results match your filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const statusCfg = STATUS_CONFIG[app.status] ?? {
                    label: app.status,
                    color: "text-gray-600",
                    bg: "bg-gray-100",
                  };
                  return (
                    <tr key={app.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{app.job_title}</span>
                          {app.job_url && (
                            <a
                              href={app.job_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {app.company}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(app.date_applied)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {app.resume_name ?? app.resumes?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={app.status}
                          onValueChange={(v) => handleStatusChange(app.id, v)}
                        >
                          <SelectTrigger className="h-7 w-[130px] border-none p-0 focus:ring-0">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${statusCfg.bg} ${statusCfg.color}`}
                            >
                              {statusCfg.label}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                        {app.notes ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(app.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Job Title *</Label>
                <Input
                  value={newApp.job_title}
                  onChange={(e) =>
                    setNewApp({ ...newApp, job_title: e.target.value })
                  }
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-1">
                <Label>Company *</Label>
                <Input
                  value={newApp.company}
                  onChange={(e) =>
                    setNewApp({ ...newApp, company: e.target.value })
                  }
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Job URL</Label>
              <Input
                value={newApp.job_url}
                onChange={(e) =>
                  setNewApp({ ...newApp, job_url: e.target.value })
                }
                placeholder="https://linkedin.com/jobs/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Date Applied</Label>
                <Input
                  type="date"
                  value={newApp.date_applied}
                  onChange={(e) =>
                    setNewApp({ ...newApp, date_applied: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={newApp.status}
                  onValueChange={(v) => setNewApp({ ...newApp, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {resumes.length > 0 && (
              <div className="space-y-1">
                <Label>Resume Used</Label>
                <Select
                  value={newApp.resume_id}
                  onValueChange={(v) => setNewApp({ ...newApp, resume_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resume..." />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea
                value={newApp.notes}
                onChange={(e) =>
                  setNewApp({ ...newApp, notes: e.target.value })
                }
                placeholder="Referral from John. Strong match for skills..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={saving || !newApp.job_title || !newApp.company}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
