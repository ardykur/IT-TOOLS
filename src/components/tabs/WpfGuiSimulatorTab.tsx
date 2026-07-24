import React, { useState } from 'react';
import { SoftwareApp, SystemTool, SystemTweak, SystemInformation } from '../../types';
import { Play, CheckSquare, Square, RefreshCw, Terminal, Monitor, HardDrive, ShieldAlert, FileText, Settings, Sparkles } from 'lucide-react';

interface WpfGuiSimulatorTabProps {
  apps: SoftwareApp[];
  tools: SystemTool[];
  tweaks: SystemTweak[];
  systemInfo: SystemInformation;
  onToggleApp: (id: string) => void;
  onRunBatchInstall: (selectedAppIds: string[]) => void;
  onRunTool: (toolId: string, param1?: string, param2?: string) => void;
  onRunTweak: (tweakId: string) => void;
  terminalLogs: string[];
  isExecuting: boolean;
  theme: 'wpf_dark' | 'wpf_light' | 'wpf_classic';
}

export const WpfGuiSimulatorTab: React.FC<WpfGuiSimulatorTabProps> = ({
  apps,
  tools,
  tweaks,
  systemInfo,
  onToggleApp,
  onRunBatchInstall,
  onRunTool,
  onRunTweak,
  terminalLogs,
  isExecuting,
  theme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [quickHostname, setQuickHostname] = useState<string>(systemInfo.network.hostname);

  const categories = ['All', 'Productivity', 'Enterprise', 'PDF & Docs', 'Browser', 'Network', 'Security', 'Utility'];

  const filteredApps = selectedCategory === 'All' 
    ? apps 
    : apps.filter(a => a.category === selectedCategory);

  const selectedCount = apps.filter(a => a.status === 'queued' || a.status === 'installing').length;

  const bgContainer = theme === 'wpf_light' 
    ? 'bg-slate-100 text-slate-800' 
    : theme === 'wpf_classic'
    ? 'bg-gradient-to-b from-sky-900 via-slate-800 to-slate-900 text-white'
    : 'bg-[#0D0F14] text-slate-200';

  return (
    <div className={`p-3 md:p-4 rounded-xl border border-slate-800/80 font-sans transition-colors ${bgContainer}`}>
      {/* Simulated Windows WPF Application Frame */}
      <div className="max-w-6xl mx-auto rounded-lg overflow-hidden border border-slate-800 shadow-2xl bg-[#111419]">
        {/* WPF Window Title Bar */}
        <div className="bg-[#16191F] border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center space-x-2 text-slate-300">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold text-slate-100">ICT PDSI Utility v1.0 - [WPF XAML Window]</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Main.xaml</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 hover:text-white cursor-pointer px-1.5">_</span>
            <span className="text-slate-500 hover:text-white cursor-pointer px-1.5">☐</span>
            <span className="text-slate-500 hover:bg-rose-600 hover:text-white cursor-pointer px-2 py-0.5 rounded">✕</span>
          </div>
        </div>

        {/* WPF Header Section */}
        <div className="bg-[#16191F] p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-100 flex items-center space-x-2">
              <span>Workstation Setup &amp; Deployment Manager</span>
            </h2>
            <p className="text-[11px] font-mono text-slate-400 mt-1">
              Source: GitHub Repo | Media: D:\ICT_Tools | Target: <span className="text-blue-400 font-bold">{systemInfo.network.hostname}</span> ({systemInfo.domain.domainName})
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                const queuedIds = apps.filter(a => a.status === 'queued').map(a => a.id);
                if (queuedIds.length > 0) {
                  onRunBatchInstall(queuedIds);
                } else {
                  const mandatoryIds = apps.filter(a => a.mandatory).map(a => a.id);
                  onRunBatchInstall(mandatoryIds);
                }
              }}
              disabled={isExecuting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs shadow-lg transition disabled:opacity-50 uppercase tracking-wider"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {isExecuting ? 'Executing Queue...' : `EXECUTE QUEUE (${selectedCount > 0 ? selectedCount : 'MANDATORY'})`}
              </span>
            </button>

            <button
              onClick={() => onRunTweak('temp_cleanup')}
              disabled={isExecuting}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono font-medium transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Temp Cleanup</span>
            </button>
          </div>
        </div>

        {/* Category Tabs inside WPF Interface */}
        <div className="bg-[#0A0C10] px-4 py-2 border-b border-slate-800 flex overflow-x-auto gap-1.5 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded font-medium text-xs transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'bg-[#16191F] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main WPF Content Grid */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5 bg-[#0D0F14]">
          {/* Software Installers Column (2/3) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span>Software Installation Queue ({filteredApps.length})</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Click item to queue/unqueue
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
              {filteredApps.map((app) => {
                const isSelected = app.status === 'queued' || app.status === 'installing';
                const isInstalled = app.status === 'installed';

                return (
                  <div
                    key={app.id}
                    onClick={() => !isExecuting && onToggleApp(app.id)}
                    className={`p-3 rounded border transition cursor-pointer select-none flex items-center space-x-3 ${
                      isInstalled
                        ? 'bg-[#16191F]/50 border-slate-800 opacity-70'
                        : isSelected
                        ? 'bg-blue-600/10 border-blue-500 text-slate-100 shadow-md'
                        : 'bg-[#16191F] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <input
                        type="checkbox"
                        checked={isSelected || isInstalled}
                        onChange={() => {}}
                        className="rounded border-slate-700 bg-slate-900 text-blue-500 w-4 h-4"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-200 truncate">{app.name}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">
                          {app.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
                        <span>{app.estimatedMB} MB</span>
                        <span className={`capitalize font-bold ${
                          isInstalled ? 'text-emerald-400' : isSelected ? 'text-blue-400' : 'text-slate-500'
                        }`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Admin Tools Column (1/3) */}
          <div className="space-y-4">
            {/* Quick Tasks Grid */}
            <div className="bg-[#16191F] border border-slate-800 p-3.5 rounded space-y-3">
              <h3 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                Quick Tasks
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onRunTool('rename_hostname', quickHostname)}
                  disabled={isExecuting}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-800/50 border border-slate-700 rounded hover:border-blue-500 transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-200">RENAME</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 uppercase font-mono">HOSTNAME</span>
                </button>

                <button
                  onClick={() => onRunTool('join_domain', systemInfo.domain.domainName)}
                  disabled={isExecuting}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-800/50 border border-slate-700 rounded hover:border-blue-500 transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-200">JOIN</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 uppercase font-mono">DOMAIN</span>
                </button>

                <button
                  onClick={() => onRunTool('flush_dns')}
                  disabled={isExecuting}
                  className="flex flex-col items-center justify-center p-2.5 bg-slate-800/50 border border-slate-700 rounded hover:border-blue-500 transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-200">FLUSH</span>
                  <span className="text-[8px] text-slate-500 mt-0.5 uppercase font-mono">DNS</span>
                </button>

                <button
                  onClick={() => onRunTweak('temp_cleanup')}
                  disabled={isExecuting}
                  className="flex flex-col items-center justify-center p-2.5 bg-amber-600/10 border border-amber-600/30 rounded hover:border-amber-500 transition-colors"
                >
                  <span className="text-[10px] font-bold text-amber-400">CLEAN</span>
                  <span className="text-[8px] text-amber-500/80 mt-0.5 uppercase font-mono">TEMP FILES</span>
                </button>
              </div>

              <div className="pt-2 space-y-1.5 border-t border-slate-800">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Set Workstation Name:</label>
                <input
                  type="text"
                  value={quickHostname}
                  onChange={(e) => setQuickHostname(e.target.value)}
                  className="w-full bg-[#0A0C10] border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* System Snapshot Block */}
            <div className="bg-[#111419] border border-slate-800 rounded divide-y divide-slate-800/80">
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Processor</span>
                <span className="text-[10px] font-mono text-slate-200 truncate max-w-[140px]">{systemInfo.hardware.cpu}</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">RAM</span>
                <span className="text-[10px] font-mono text-slate-200">{systemInfo.hardware.ramInstalled}</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">OS Build</span>
                <span className="text-[10px] font-mono text-slate-200">{systemInfo.os.versionBuild}</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono">IPv4</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{systemInfo.network.ipv4Address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Terminal Output in WPF Simulator */}
        <div className="bg-black border-t border-slate-800 p-3 font-mono text-[10px]">
          <div className="flex items-center justify-between mb-2 text-slate-500 text-[10px] uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              PowerShell 5.1 Host Output Log
            </span>
            <span>Console Mode Active</span>
          </div>

          <div className="bg-black border border-slate-800/80 rounded p-2.5 h-28 overflow-y-auto space-y-1 text-slate-400 font-mono text-[10px] leading-relaxed">
            {terminalLogs.length === 0 ? (
              <span className="text-slate-600 italic">
                [PDSI Utility] Ready for execution...
              </span>
            ) : (
              terminalLogs.map((log, index) => (
                <div key={index} className="break-all whitespace-pre-wrap">
                  {log.includes('SUCCESS') || log.includes('[+]') ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : log.includes('FAILED') || log.includes('ERROR') ? (
                    <span className="text-rose-400">{log}</span>
                  ) : log.includes('WARNING') ? (
                    <span className="text-amber-300">{log}</span>
                  ) : (
                    <span className="text-slate-400">{log}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
