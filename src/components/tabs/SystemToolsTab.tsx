import React, { useState } from 'react';
import { SystemTool } from '../../types';
import { Wrench, Terminal, Play, ShieldAlert, Cpu, Network, CheckCircle2 } from 'lucide-react';

interface SystemToolsTabProps {
  tools: SystemTool[];
  onRunTool: (toolId: string, param1?: string, param2?: string) => void;
  isExecuting: boolean;
}

export const SystemToolsTab: React.FC<SystemToolsTabProps> = ({
  tools,
  onRunTool,
  isExecuting,
}) => {
  const [paramMap, setParamMap] = useState<Record<string, { param1: string; param2: string }>>(() => {
    const initial: Record<string, { param1: string; param2: string }> = {};
    tools.forEach((tool) => {
      initial[tool.id] = {
        param1: tool.paramDefault || '',
        param2: tool.secondParamDefault || '',
      };
    });
    return initial;
  });

  const handleParamChange = (toolId: string, field: 'param1' | 'param2', value: string) => {
    setParamMap((prev) => ({
      ...prev,
      [toolId]: {
        ...prev[toolId],
        [field]: value,
      },
    }));
  };

  const getSubstitudedCommand = (tool: SystemTool) => {
    const p = paramMap[tool.id] || { param1: '', param2: '' };
    let cmd = tool.psCommand;
    if (tool.requiresParams) {
      cmd = cmd.replace('{param1}', p.param1 || tool.paramDefault || '');
      if (tool.secondParamLabel) {
        cmd = cmd.replace('{param2}', p.param2 || tool.secondParamDefault || '');
      }
    }
    return cmd;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#16191F] p-4 rounded border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">Windows System Administration Tools</h2>
            <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-mono border border-purple-700/50">
              Phase 5 - SRS Spec
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Centralized administration utilities for network configuration, Active Directory domain join, and system MMC consoles.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const currentParams = paramMap[tool.id] || { param1: '', param2: '' };
          const actualCommand = getSubstitudedCommand(tool);

          return (
            <div
              key={tool.id}
              className="bg-[#16191F] border border-slate-800 rounded p-4 shadow-md flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-100">{tool.name}</h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  {tool.description}
                </p>

                {/* Parameter inputs if required */}
                {tool.requiresParams && (
                  <div className="mt-3 space-y-2 bg-[#0A0C10] p-2.5 rounded border border-slate-800">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block mb-1">
                        {tool.paramLabel || 'Parameter 1'}:
                      </label>
                      <input
                        type="text"
                        value={currentParams.param1}
                        placeholder={tool.paramPlaceholder}
                        onChange={(e) => handleParamChange(tool.id, 'param1', e.target.value)}
                        className="w-full bg-[#16191F] border border-slate-700 rounded px-2 py-1 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {tool.secondParamLabel && (
                      <div>
                        <label className="text-[10px] font-mono text-slate-400 block mb-1">
                          {tool.secondParamLabel}:
                        </label>
                        <input
                          type="text"
                          value={currentParams.param2}
                          placeholder={tool.secondParamPlaceholder}
                          onChange={(e) => handleParamChange(tool.id, 'param2', e.target.value)}
                          className="w-full bg-[#16191F] border border-slate-700 rounded px-2 py-1 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Command Preview */}
                <div className="mt-3 bg-[#0A0C10] p-2.5 rounded border border-slate-800/80 font-mono text-[10px] text-slate-400">
                  <span className="text-slate-500 block text-[9px] uppercase mb-0.5">PowerShell 5.1 Command:</span>
                  <code className="text-emerald-400 break-all">{actualCommand}</code>
                </div>
              </div>

              {/* Run Action Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onRunTool(tool.id, currentParams.param1, currentParams.param2)}
                  disabled={isExecuting}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow-md transition disabled:opacity-50 uppercase tracking-wider"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Command</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
