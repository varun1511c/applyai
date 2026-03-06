import { createClient } from "@/lib/supabase/server";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WeeklyGoalCard } from "@/components/dashboard/WeeklyGoalCard";
import { Sparkles } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch stats + profile in parallel
  const [{ data: applications }, { data: settings }, { data: profile }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, status, date_applied, company, job_title, created_at, platform")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_settings")
      .select("weekly_goal")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single(),
  ]);

  const apps = applications ?? [];
  const weeklyGoal = settings?.weekly_goal ?? 5;
  const firstName = profile?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";

  // Compute stats
  const total = apps.length;
  const activeInterviews = apps.filter((a) =>
    ["interview", "phone_screen", "technical"].includes(a.status)
  ).length;
  const responded = apps.filter((a) =>
    ["phone_screen", "interview", "technical", "offer", "rejected"].includes(a.status)
  ).length;
  const responseRate =
    total > 0 ? Math.round((responded / total) * 100) : 0;

  // This week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeek = apps.filter(
    (a) => a.date_applied && new Date(a.date_applied) >= oneWeekAgo
  ).length;

  // Last 30 days chart data
  const last30: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = apps.filter(
      (a) => a.date_applied && a.date_applied.startsWith(dateStr)
    ).length;
    last30.push({
      date: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d),
      count,
    });
  }

  // Status breakdown
  const statusMap: Record<string, number> = {};
  apps.forEach((a) => {
    statusMap[a.status] = (statusMap[a.status] ?? 0) + 1;
  });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Platform breakdown
  const platformMap: Record<string, { applied: number; responded: number }> = {};
  apps.forEach((a) => {
    const p = a.platform ?? "other";
    if (!platformMap[p]) platformMap[p] = { applied: 0, responded: 0 };
    platformMap[p].applied++;
    if (["phone_screen", "interview", "technical", "offer", "rejected"].includes(a.status)) {
      platformMap[p].responded++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-lg">
        {/* Decorative blobs */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-400">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                {firstName}
              </span>{" "}
              👋
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {total === 0
                ? "Start your job search journey — add your first application!"
                : `You've applied to ${total} job${total !== 1 ? "s" : ""} so far. Keep it up!`}
            </p>
          </div>

          {/* Quick stats pill */}
          {total > 0 && (
            <div className="hidden sm:flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-2.5">
              <div className="text-center">
                <p className="text-xl font-black text-white">{thisWeek}</p>
                <p className="text-xs text-slate-400">this week</p>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-center">
                <p className="text-xl font-black text-emerald-400">{responseRate}%</p>
                <p className="text-xs text-slate-400">response rate</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <StatsCards
        total={total}
        thisWeek={thisWeek}
        responseRate={responseRate}
        activeInterviews={activeInterviews}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCharts
            lineData={last30}
            donutData={statusData}
          />
        </div>
        <div className="space-y-6">
          <WeeklyGoalCard current={thisWeek} goal={weeklyGoal} />
          <RecentActivity applications={apps.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
