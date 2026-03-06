"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TopNavProps {
  title: string;
  user?: {
    email?: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

export function TopNav({ user }: TopNavProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-6 backdrop-blur-sm">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
          <Zap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-sm font-black text-transparent">
          ApplyAI
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Avatar dropdown */}
        <div className="group relative">
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white ring-2 ring-slate-800 transition-all hover:ring-blue-500/50">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </button>

          {/* Dropdown */}
          <div className="invisible absolute right-0 top-10 z-50 w-52 rounded-xl border border-slate-700/60 bg-slate-900 p-1 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
            <div className="px-3 py-2 border-b border-slate-800 mb-1">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name ?? "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => router.push("/settings")}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
