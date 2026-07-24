import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Copy, Trash2, Check } from 'lucide-react';

interface TerminalDrawerProps {
  logs: string[];
  onClear: () => void;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({ logs, onClear }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950 border-t border-slate-800 shadow-2xl transition-all">
      {/* Header bar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-slate-300 hover:text-white font-bold"
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>PowerShell 5.1 Host Output Log ({logs.length} lines)</span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLogs}
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onClear}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
            title="Clear terminal output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      {isOpen && (
        <div className="p-3 bg-slate-950/95 font-mono text-[11px] h-36 overflow-y-auto space-y-1 leading-relaxed border-t border-slate-900 text-slate-300">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">
              [PDSI System] PowerShell 5.1 console ready. Commands executed from WPF GUI, Tools, or Tweaks will stream live here.
            </div>
          ) : (
            logs.map((line, idx) => (
              <div key={idx} className="break-all whitespace-pre-wrap">
                {line.includes('SUCCESS') ? (
                  <span className="text-emerald-400 font-semibold">{line}</span>
                ) : line.includes('FAILED') || line.includes('ERROR') ? (
                  <span className="text-rose-400 font-semibold">{line}</span>
                ) : line.includes('WARNING') ? (
                  <span className="text-amber-300">{line}</span>
                ) : line.includes('[+]') ? (
                  <span className="text-cyan-300">{line}</span>
                ) : (
                  <span className="text-slate-300">{line}</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
