import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { SystemInformation } from '../types';

interface HeaderBarProps {
  systemInfo: SystemInformation;
  activeTheme: 'wpf_dark' | 'wpf_light' | 'wpf_classic';
  onThemeChange: (theme: 'wpf_dark' | 'wpf_light' | 'wpf_classic') => void;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  systemInfo,
  activeTheme,
  onThemeChange,
  onQuickSync,
  isSyncing,
}) => {
  return (
    <header className="h-12 bg-[#16191F] border-b border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-lg text-slate-300 font-sans">
      {/* Brand & Version */}
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-sm">
          P
        </div>
        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-bold tracking-tight text-white uppercase">
            ICT PDSI Utility <span className="text-slate-500 font-normal ml-2 font-mono text-xs lowercase">v1.0.0-Draft</span>
          </h1>
        </div>
      </div>

      {/* Live High-Density Status Indicators */}
      <div className="hidden md:flex items-center space-x-6 text-[10px] uppercase tracking-widest text-slate-400 font-mono">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
          <span>Connected: {systemInfo.network.hostname}</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          <span>Domain: {systemInfo.domain.domainName}</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          <span>Admin: {systemInfo.domain.currentUser}</span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onQuickSync}
          disabled={isSyncing}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-mono font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition disabled:opacity-50"
          title="Check GitHub Repo for latest source code updates"
        >
          <RefreshCw className={`w-3 h-3 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="uppercase text-[10px] tracking-wider">{isSyncing ? 'Syncing...' : 'GitHub Sync'}</span>
        </button>

        {/* Theme Selector */}
        <select
          value={activeTheme}
          onChange={(e) => onThemeChange(e.target.value as any)}
          className="text-[11px] bg-[#111419] text-slate-300 border border-slate-800 rounded px-2 py-1 font-mono focus:outline-none focus:border-blue-500"
        >
          <option value="wpf_dark">WPF Dark</option>
          <option value="wpf_light">WPF Light</option>
          <option value="wpf_classic">Classic Aero</option>
        </select>
      </div>
    </header>
  );
};

