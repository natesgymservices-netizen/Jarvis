"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Mic, MicOff } from "lucide-react";

interface JarvisVoiceProps {
  greeting: string;
  brief: string;
}

const CLAP_THRESHOLD = 0.22;   // minimum RMS volume to count as a clap
const RISE_THRESHOLD = 0.14;   // minimum jump from previous frame (sharp spike = clap, not steady noise)
const COOLDOWN_MS    = 2500;   // minimum ms between triggers

export function JarvisVoice({ greeting, brief }: JarvisVoiceProps) {
  const [speaking, setSpeaking]         = useState(false);
  const [muted, setMuted]               = useState(false);
  const [ready, setReady]               = useState(false);
  const [listening, setListening]       = useState(false);
  const [clapFlash, setClapFlash]       = useState(false);
  const [micError, setMicError]         = useState<string | null>(null);

  const hasSpoken    = useRef(false);
  const audioCtx     = useRef<AudioContext | null>(null);
  const analyser     = useRef<AnalyserNode | null>(null);
  const stream       = useRef<MediaStream | null>(null);
  const rafId        = useRef<number>(0);
  const lastClap     = useRef<number>(0);
  const prevRms      = useRef<number>(0);

  // ── Voice synthesis ─────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis || muted) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred = [
      voices.find((v) => v.name === "Daniel"),
      voices.find((v) => v.name.includes("Daniel") && v.lang === "en-GB"),
      voices.find((v) => v.lang === "en-GB"),
      voices.find((v) => v.lang.startsWith("en")),
    ].find(Boolean);

    if (preferred) utter.voice = preferred;
    utter.pitch  = 0.85;
    utter.rate   = 0.92;
    utter.volume = 1;

    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utter);
  }, [muted]);

  // ── Clap detection loop ──────────────────────────────────────
  const startListening = useCallback(async () => {
    try {
      setMicError(null);
      const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      stream.current = s;

      const ctx = new AudioContext();
      audioCtx.current = ctx;

      const src  = ctx.createMediaStreamSource(s);
      const node = ctx.createAnalyser();
      node.fftSize = 256;
      src.connect(node);
      analyser.current = node;

      const buf = new Float32Array(node.fftSize);

      function detect() {
        node.getFloatTimeDomainData(buf);

        // RMS volume
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);

        const rise = rms - prevRms.current;
        const now  = Date.now();

        if (rms > CLAP_THRESHOLD && rise > RISE_THRESHOLD && now - lastClap.current > COOLDOWN_MS) {
          lastClap.current = now;
          setClapFlash(true);
          setTimeout(() => setClapFlash(false), 400);
          speak(`${greeting}. ${brief}`);
        }

        prevRms.current = rms;
        rafId.current = requestAnimationFrame(detect);
      }

      detect();
      setListening(true);
    } catch (err) {
      setMicError("Mic access denied");
      setListening(false);
    }
  }, [speak, greeting, brief]);

  const stopListening = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    audioCtx.current?.close();
    stream.current  = null;
    audioCtx.current = null;
    analyser.current = null;
    setListening(false);
  }, []);

  // ── Voices ready ─────────────────────────────────────────────
  useEffect(() => {
    const onVoices = () => setReady(true);
    if (window.speechSynthesis.getVoices().length > 0) setReady(true);
    else window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
  }, []);

  // ── Auto-greet once on load ───────────────────────────────────
  useEffect(() => {
    if (!ready || hasSpoken.current || muted) return;
    hasSpoken.current = true;
    const t = setTimeout(() => speak(`${greeting}. ${brief}`), 900);
    return () => clearTimeout(t);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ────────────────────────────────────────
  useEffect(() => () => stopListening(), [stopListening]);

  // ── Mute also stops speaking ──────────────────────────────────
  useEffect(() => { if (muted) window.speechSynthesis.cancel(); }, [muted]);

  function handleSpeak() {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); }
    else speak(`${greeting}. ${brief}`);
  }

  return (
    <div className="flex items-center gap-2">

      {/* Clap listener toggle */}
      <button
        onClick={listening ? stopListening : startListening}
        title={listening ? "Stop clap detection" : "Enable clap to trigger JARVIS"}
        className={[
          "flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-all",
          clapFlash
            ? "border-cyan-300 bg-cyan-400/20 text-cyan-200 shadow-[0_0_16px_rgba(0,200,255,0.6)]"
            : listening
            ? "border-cyan-400/60 bg-cyan-950/40 text-cyan-400 animate-pulse-glow"
            : "border-cyan-500/30 bg-black/60 text-cyan-700 hover:border-cyan-500/60 hover:text-cyan-500",
        ].join(" ")}
      >
        {listening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
        {clapFlash ? "Clap detected!" : listening ? "Listening" : "Clap mode"}
      </button>

      {/* Manual briefing button */}
      <button
        onClick={handleSpeak}
        title={speaking ? "Stop" : "Trigger JARVIS briefing"}
        className="flex items-center gap-2 border border-cyan-500/40 bg-black/60 px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-cyan-400 hover:border-cyan-400/70 hover:text-cyan-300 transition-all uppercase"
        style={speaking ? { boxShadow: "0 0 12px rgba(0,200,255,0.4)" } : {}}
      >
        <span className="flex items-end gap-0.5 h-3">
          {[6, 10, 8, 5].map((h, i) => (
            <span
              key={i}
              className="w-0.5 bg-cyan-400 rounded-full"
              style={{
                height: speaking ? `${h}px` : "3px",
                transition: "height 0.15s ease",
                animation: speaking ? `wave-bar ${0.4 + i * 0.1}s ease-in-out infinite alternate` : "none",
              }}
            />
          ))}
        </span>
        {speaking ? "Speaking..." : "Briefing"}
      </button>

      {/* Mute */}
      <button
        onClick={() => setMuted((m) => !m)}
        title={muted ? "Unmute JARVIS" : "Mute JARVIS"}
        className="border border-cyan-500/30 bg-black/60 p-1.5 text-cyan-700 hover:text-cyan-500 hover:border-cyan-500/50 transition-all"
      >
        {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>

      {micError && (
        <span className="font-mono text-[9px] text-red-500 tracking-wider">{micError}</span>
      )}

      <style>{`
        @keyframes wave-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  );
}
