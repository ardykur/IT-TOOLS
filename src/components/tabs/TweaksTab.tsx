import React from 'react';
import { SystemTweak } from '../../types';
import { Sliders, Play, Shield, ShieldAlert, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

interface TweaksTabProps {
  tweaks: SystemTweak[];
  onRunTweak: (tweakId: string) => void;
  onRunBatchTweaks: (tweakIds: string[]) => void;
  isExecuting: boolean;
}

export const TweaksTab: React.FC<TweaksTabProps> = ({
  tweaks,
  onRunTweak,
  onRunBatchTweaks,
  isExecuting,
}) => {
  const recommendedTweaks = tweaks.filter(t => t.recommended);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#16191F] p-4 rounded border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">Windows Performance Tweaks &amp; Fixes</h2>
            <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-mono border border-emerald-700/50">
              Phase 6 - SRS Spec
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            System cleanup, integrity verification, registry optimizations, and power profile adjustments.
          </p>
        </div>

        <button
          onClick={() => onRunBatchTweaks(recommendedTweaks.map(t => t.id))}
          disabled={isExecuting}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow-md transition disabled:opacity-50 uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Apply All Recommended ({recommendedTweaks.length})</span>
        </button>
      </div>

      {/* Tweaks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tweaks.map((tweak) => {
          const riskColor = 
            tweak.risk === 'Safe' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700' :
            tweak.risk === 'Moderate' ? 'bg-amber-900/60 text-amber-300 border-amber-700' :
            'bg-rose-900/60 text-rose-300 border-rose-700';

          return (
            <div
              key={tweak.id}
              className="bg-[#16191F] border border-slate-800 rounded p-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100">{tweak.name}</h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {tweak.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {tweak.recommended && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 font-mono">
                        REC
                      </span>
                    )}
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${riskColor}`}>
                      {tweak.risk}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  {tweak.description}
                </p>

                {/* PowerShell Command Block */}
                <div className="mt-3 bg-[#0A0C10] p-2.5 rounded border border-slate-800/80 font-mono text-[10px] text-slate-400">
                  <span className="text-slate-500 block text-[9px] uppercase mb-0.5">PowerShell 5.1 Script:</span>
                  <pre className="text-emerald-400 whitespace-pre-wrap break-all leading-normal text-[10px]">
                    {tweak.psCommand}
                  </pre>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onRunTweak(tweak.id)}
                  disabled={isExecuting}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold transition disabled:opacity-50 font-mono"
                >
                  <Play className="w-3 h-3 text-emerald-400 fill-current" />
                  <span>Execute Tweak</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
