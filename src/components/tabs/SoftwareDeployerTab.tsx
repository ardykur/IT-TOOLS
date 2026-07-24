import React, { useState } from 'react';
import { SoftwareApp, AppCategory } from '../../types';
import { Download, CheckCircle2, AlertCircle, Play, Search, Filter, ShieldCheck, HardDrive, Edit2, Save, X } from 'lucide-react';

interface SoftwareDeployerTabProps {
  apps: SoftwareApp[];
  onToggleApp: (id: string) => void;
  onUpdateAppArgs: (id: string, newArgs: string) => void;
  onRunBatchInstall: (selectedAppIds: string[]) => void;
  onInstallSingleApp: (id: string) => void;
  isExecuting: boolean;
}

export const SoftwareDeployerTab: React.FC<SoftwareDeployerTabProps> = ({
  apps,
  onToggleApp,
  onUpdateAppArgs,
  onRunBatchInstall,
  onInstallSingleApp,
  isExecuting,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [tempArgs, setTempArgs] = useState<string>('');

  const categories = ['All', 'Productivity', 'PDF & Docs', 'Browser', 'Enterprise', 'Network', 'Communication', 'Remote', 'Security', 'Utility'];

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.installerFileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const queuedApps = apps.filter(a => a.status === 'queued');
  const totalQueuedMB = queuedApps.reduce((acc, curr) => acc + curr.estimatedMB, 0);

  const startEditArgs = (app: SoftwareApp) => {
    setEditingAppId(app.id);
    setTempArgs(app.silentArgs);
  };

  const saveArgs = (appId: string) => {
    onUpdateAppArgs(appId, tempArgs);
    setEditingAppId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Batch Control Bar */}
      <div className="bg-[#16191F] p-4 rounded border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">Standardized Workstation Software Deployer</h2>
            <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-mono border border-blue-700/50">
              Phase 4 - SRS Spec
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Silent background installer engine running from external SSD media (<code className="text-amber-300 font-mono">D:\ICT_Tools\Installers</code>).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right text-xs font-mono">
            <span className="text-slate-500 block text-[10px] uppercase">Queue Summary:</span>
            <span className="font-bold text-blue-400">
              {queuedApps.length} packages selected ({(totalQueuedMB / 1024).toFixed(2)} GB)
            </span>
          </div>

          <button
            onClick={() => {
              const allMandatory = apps.filter(a => a.mandatory).map(a => a.id);
              allMandatory.forEach(id => {
                if (apps.find(a => a.id === id)?.status === 'not_installed') {
                  onToggleApp(id);
                }
              });
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition"
          >
            Select All Mandatory
          </button>

          <button
            onClick={() => {
              const selectedIds = queuedApps.map(a => a.id);
              if (selectedIds.length > 0) {
                onRunBatchInstall(selectedIds);
              }
            }}
            disabled={isExecuting || queuedApps.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow-md transition disabled:opacity-50 uppercase tracking-wider"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Install Queue ({queuedApps.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111419] p-2.5 rounded border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search package or installer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0C10] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Software Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredApps.map((app) => {
          const isQueued = app.status === 'queued';
          const isInstalling = app.status === 'installing';
          const isInstalled = app.status === 'installed';

          return (
            <div
              key={app.id}
              className={`p-3.5 rounded border transition flex flex-col justify-between ${
                isInstalled
                  ? 'bg-[#16191F]/50 border-slate-800 text-slate-400'
                  : isQueued
                  ? 'bg-[#16191F] border-blue-500/80 shadow-lg ring-1 ring-blue-500/30'
                  : 'bg-[#16191F] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isQueued || isInstalling}
                      disabled={isInstalled || isExecuting}
                      onChange={() => onToggleApp(app.id)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <h3 className="text-xs font-bold text-slate-100 leading-snug">{app.name}</h3>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {app.mandatory && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-300 border border-blue-700/80 font-mono">
                        REQ
                      </span>
                    )}
                    <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {app.category}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {app.description}
                </p>

                {/* Installer details */}
                <div className="mt-3 space-y-1 text-[10px] font-mono text-slate-400 bg-[#0A0C10] p-2.5 rounded border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File:</span>
                    <span className="text-slate-300 font-semibold truncate max-w-[150px]">{app.installerFileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Size:</span>
                    <span className="text-amber-300">{app.estimatedMB} MB</span>
                  </div>

                  {/* Silent Args Edit */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span>Silent Setup Flags:</span>
                      {editingAppId === app.id ? (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => saveArgs(app.id)}
                            className="text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={() => setEditingAppId(null)}
                            className="text-slate-400 hover:underline flex items-center gap-0.5"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditArgs(app)}
                          className="text-blue-400 hover:underline flex items-center gap-0.5"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </div>

                    {editingAppId === app.id ? (
                      <input
                        type="text"
                        value={tempArgs}
                        onChange={(e) => setTempArgs(e.target.value)}
                        className="w-full bg-[#16191F] border border-blue-500 rounded px-2 py-1 text-xs text-blue-300 font-mono focus:outline-none"
                      />
                    ) : (
                      <code className="text-blue-300 text-[10px] block truncate">{app.silentArgs}</code>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Action Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                <div>
                  {isInstalled ? (
                    <span className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Installed</span>
                    </span>
                  ) : isInstalling ? (
                    <span className="flex items-center space-x-1 text-blue-400 text-xs font-semibold animate-pulse">
                      <Download className="w-3.5 h-3.5 animate-bounce" />
                      <span>Installing...</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs font-mono">Ready on SSD</span>
                  )}
                </div>

                {!isInstalled && (
                  <button
                    onClick={() => onInstallSingleApp(app.id)}
                    disabled={isExecuting}
                    className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-semibold transition disabled:opacity-50"
                  >
                    <Download className="w-3 h-3 text-blue-400" />
                    <span>Install Now</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
