"use client";

import { signIn } from "next-auth/react";
import { Zap } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(0,200,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.05) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      {/* Radial glow from centre */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,200,255,0.06) 0%, transparent 70%)'
      }} />

      {/* Arc reactor rings — decorative */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/8 animate-spin-slow" />
        <div className="absolute w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/5" style={{ animationDuration: '20s', animation: 'spin-slow 20s linear infinite reverse' }} />
        <div className="absolute w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/10" style={{ animation: 'spin-slow 12s linear infinite' }} />
      </div>

      {/* Scanline */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-scanline pointer-events-none" />

      {/* Corner HUD decorations */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-cyan-500/40" />
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-cyan-500/40" />
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-cyan-500/40" />
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-cyan-500/40" />

      {/* System labels */}
      <div className="absolute top-8 left-24 font-mono text-[10px] tracking-[0.3em] text-cyan-600 uppercase animate-flicker">
        Stark Industries · AI v7.0
      </div>
      <div className="absolute bottom-8 right-24 font-mono text-[10px] tracking-[0.3em] text-cyan-600 uppercase">
        Secure Channel · AES-256
      </div>
      <div className="absolute top-8 right-24 font-mono text-[10px] tracking-[0.3em] text-cyan-600 uppercase">
        Node: AU-EAST-1 · Online
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-sm mx-6 animate-slide-up">
        {/* HUD corners */}
        <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-cyan-400/80" />
        <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-cyan-400/80" />
        <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-cyan-400/80" />
        <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-cyan-400/80" />

        <div className="bg-black/90 border border-cyan-500/30 p-8"
          style={{ boxShadow: '0 0 40px rgba(0,200,255,0.1), inset 0 0 40px rgba(0,200,255,0.03)' }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400/70 flex items-center justify-center animate-pulse-glow">
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-lg animate-arc-pulse" />
              <div className="absolute -inset-2 rounded-full border border-cyan-400/20 animate-spin-slow" />
              <div className="absolute -inset-4 rounded-full border border-cyan-400/10" style={{ animation: 'spin-slow 12s linear infinite reverse' }} />
            </div>
            <h1 className="font-mono text-2xl tracking-[0.3em] text-cyan-300 text-glow font-bold uppercase">
              J.A.R.V.I.S.
            </h1>
            <p className="font-mono text-[10px] tracking-[0.4em] text-cyan-600 mt-1 uppercase">
              Business Intelligence System
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-[9px] tracking-[0.25em] text-cyan-500 uppercase">Awaiting Authorization</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-cyan-500/40" />
            <span className="font-mono text-[9px] tracking-[0.3em] text-cyan-600 uppercase">Identity Verification</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-cyan-500/40" />
          </div>

          {/* Sign-in button */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 border border-cyan-500/40 bg-cyan-950/30 py-3.5 px-4 text-sm font-mono tracking-[0.15em] text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400/60 hover:text-cyan-200 transition-all uppercase group"
            style={{ boxShadow: '0 0 20px rgba(0,200,255,0.05)' }}
          >
            <svg className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Authenticate via Google
          </button>

          <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-800 text-center mt-5 uppercase">
            Encrypted · Gmail + Calendar access required
          </p>
        </div>
      </div>
    </div>
  );
}
