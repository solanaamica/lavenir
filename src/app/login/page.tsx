"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — dark value prop */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111827] flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path d="M2 12 L5 7 L8 9 L11 4 L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Lavenir</span>
        </div>

        <div>
          <blockquote className="text-2xl font-semibold text-white leading-snug mb-4">
            "The best time to start tracking was when you made your first investment. The second best time is now."
          </blockquote>
          <div className="space-y-4 mt-10">
            {[
              { label: "Multi-asset portfolio", desc: "Stocks, crypto, mutual funds, cash" },
              { label: "Monthly milestones", desc: "Auto-detect your breakthrough moments" },
              { label: "Consistency streak", desc: "Build the habit of knowing your numbers" },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#6366f1]/20 flex items-center justify-center mt-0.5 shrink-0">
                  <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                    <path d="M2 5l2 2 4-4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{f.label}</p>
                  <p className="text-[#6B7280] text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#4B5563] text-xs">© 2025 Lavenir. Free to start, valuable forever.</p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M2 12 L5 7 L8 9 L11 4 L14 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-[#111827] text-lg">Lavenir</span>
          </div>

          <h1 className="text-2xl font-bold text-[#111827] mb-2">Welcome back</h1>
          <p className="text-[#6B7280] text-sm mb-8">Sign in to your portfolio dashboard</p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-[#E4E7EC] rounded-xl py-3.5 px-5 text-sm font-medium text-[#111827] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="7" stroke="#E4E7EC" strokeWidth="2"/>
                <path d="M9 2a7 7 0 017 7" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.2a10.34 10.34 0 00-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
                <path d="M3.98 10.72A5.4 5.4 0 013.7 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.05l3.02-2.33z" fill="#FBBC05"/>
                <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.8 11.43 0 9 0A9 9 0 00.96 4.95L3.98 7.28C4.68 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="text-center text-xs text-[#9CA3AF] mt-6 leading-relaxed">
            By signing in, you agree to our terms of service and privacy policy.
            Your data stays yours.
          </p>

          <div className="mt-8 pt-8 border-t border-[#F3F4F6] text-center">
            <a href="/" className="text-sm text-[#6366f1] hover:text-[#4f46e5] transition-colors">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
