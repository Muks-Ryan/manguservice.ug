import React from 'react';
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Wrench } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onToggleDarkMode: () => void;
  darkMode: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onToggleDarkMode, darkMode }) => (
  <main className="min-h-[calc(100vh-60px)] overflow-hidden bg-slate-950 text-white">
    <section className="relative mx-auto flex min-h-[calc(100vh-60px)] max-w-7xl items-center px-6 py-16 sm:px-10 lg:px-16">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative grid w-full items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-bold text-amber-200">
            <Wrench className="h-3.5 w-3.5" /> Trusted local service, made simple
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">Find the right technician for the job.</h1>
          <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Connect with skilled technicians across Uganda, request a service, and follow every booking from one clear workspace.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={onGetStarted} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300">Get started <ArrowRight className="h-4 w-4" /></button>
            <button onClick={onToggleDarkMode} className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-white/10">{darkMode ? 'Use light theme' : 'Use dark theme'}</button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {[
            [ShieldCheck, 'Verified professionals', 'Browse technicians with clear profiles, trades, locations, and rates.'],
            [MapPin, 'Built for Uganda', 'Start with Kampala and expand across towns as the platform grows.'],
            [CheckCircle2, 'Simple booking flow', 'Request a time, receive acceptance, and track completion from your dashboard.'],
          ].map(([Icon, title, description]) => {
            const FeatureIcon = Icon as React.ComponentType<{ className?: string }>;
            return <div key={title as string} className="rounded-2xl border border-white/10 bg-white/[.07] p-5 backdrop-blur-sm"><FeatureIcon className="mb-4 h-6 w-6 text-amber-300" /><h2 className="font-bold">{title as string}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description as string}</p></div>;
          })}
        </div>
      </div>
    </section>
  </main>
);