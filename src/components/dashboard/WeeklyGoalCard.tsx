import { Target, Flame } from "lucide-react";

interface WeeklyGoalCardProps {
  current: number;
  goal: number;
}

export function WeeklyGoalCard({ current, goal }: WeeklyGoalCardProps) {
  const pct = Math.min(Math.round((current / goal) * 100), 100);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;
  const reached = pct >= 100;

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${reached ? "bg-amber-500/15 border-amber-500/20" : "bg-blue-500/15 border-blue-500/20"}`}>
          {reached ? (
            <Flame className="h-4 w-4 text-amber-400" />
          ) : (
            <Target className="h-4 w-4 text-blue-400" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Weekly Goal</h3>
          <p className="text-xs text-slate-500">{goal} applications / week</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={reached ? "#f59e0b" : "#3b82f6"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black text-white">{current}</span>
            <span className="text-xs text-slate-400">of {goal}</span>
          </div>
        </div>

        <div className="w-full text-center">
          {reached ? (
            <p className="text-sm font-semibold text-amber-400">Goal reached! Keep going!</p>
          ) : (
            <p className="text-sm text-slate-400">
              <span className="font-bold text-white">{goal - current}</span> more to reach your goal
            </p>
          )}
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${reached ? "bg-amber-400" : "bg-gradient-to-r from-blue-500 to-violet-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
