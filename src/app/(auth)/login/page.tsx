"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute top-20 left-16 w-72 h-72 bg-blue-500/15 rounded-full animate-blob blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-16 w-80 h-80 bg-violet-500/15 rounded-full animate-blob delay-300 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-56 h-56 bg-cyan-400/10 rounded-full animate-blob delay-500 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white font-black text-lg shadow-2xl">
            A
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">ApplyAI</span>
        </div>

        {/* Glass card */}
        <div className="glass rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to continue your job search</p>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-300 text-sm font-medium">Email</Label>
              <Input
                id="email" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-sm font-medium">Password</Label>
              <Input
                id="password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-blue-400 focus-visible:border-blue-400"
              />
            </div>
            <Button
              type="submit" disabled={loading}
              className="w-full h-11 mt-1 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 text-white font-semibold btn-glow"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign up free →
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-5 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Free forever · No credit card required
        </p>
      </div>
    </div>
  );
}
