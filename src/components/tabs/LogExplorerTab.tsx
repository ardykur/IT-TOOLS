import React, { useState } from 'react';
import { ExecutionLog } from '../../types';
import { FileText, Download, Trash2, Search, Filter, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface LogExplorerTabProps {
  logs: ExecutionLog[];
  onClearLogs: () => void;
  onAddTestLog: () => void;
}

export const LogExplorerTab: React.FC<LogExplorerTabProps> = ({
  logs,
  onClearLogs,
  onAddTestLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.computerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.result.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportLogFile = () => {
    const logHeader = `================================================================================\nICT PDSI UTILITY - UTF-8 AUDIT ACTIVITY LOG\nLog Format: Timestamp | User | Computer Name | Action | Result | Status\nGenerated: ${new Date().toISOString()}\n================================================================================\n\n`;
    
    const logBody = logs.map(l => `${l.timestamp} | ${l.user} | ${l.computerName} | ${l.action} | ${l.result} | ${l.status}`).join('\n');

    const blob = new Blob([logHeader + logBody], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#16191F] p-4 rounded border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">UTF-8 Structured Activity Audit Logs</h2>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
              Section 8 - SRS Spec
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Audit logging schema: <code className="text-blue-300 font-mono">Timestamp | User | Computer Name | Action | Result | Status</code>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onAddTestLog}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono font-medium transition"
          >
            + Add Test Audit Record
          </button>

          <button
            onClick={handleExportLogFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition shadow-sm uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .log File</span>
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded border border-slate-700 transition"
            title="Clear all logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111419] p-2.5 rounded border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, user, or computer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A0C10] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          {['ALL', 'SUCCESS', 'FAILED', 'WARNING', 'IN_PROGRESS'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-[#16191F] border border-slate-800 rounded overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0C10] text-slate-400 border-b border-slate-800 text-[10px] font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Timestamp</th>
                <th className="px-3.5 py-2.5">User</th>
                <th className="px-3.5 py-2.5">Computer Name</th>
                <th className="px-3.5 py-2.5">Action</th>
                <th className="px-3.5 py-2.5">Result / Detail</th>
                <th className="px-3.5 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic font-sans">
                    No activity logs recorded matching current search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const statusBadge =
                    log.status === 'SUCCESS' ? (
                      <span className="flex items-center space-x-1 text-emerald-400 font-bold justify-end">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SUCCESS</span>
                      </span>
                    ) : log.status === 'FAILED' ? (
                      <span className="flex items-center space-x-1 text-rose-400 font-bold justify-end">
                        <XCircle className="w-3 h-3" />
                        <span>FAILED</span>
                      </span>
                    ) : log.status === 'WARNING' ? (
                      <span className="flex items-center space-x-1 text-amber-300 font-bold justify-end">
                        <AlertTriangle className="w-3 h-3" />
                        <span>WARNING</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-blue-400 font-bold justify-end animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>IN_PROGRESS</span>
                      </span>
                    );

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-3.5 py-2 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-3.5 py-2 text-purple-300 font-semibold">{log.user}</td>
                      <td className="px-3.5 py-2 text-blue-300 font-semibold">{log.computerName}</td>
                      <td className="px-3.5 py-2 text-slate-200 font-sans font-bold">{log.action}</td>
                      <td className="px-3.5 py-2 text-slate-300 max-w-xs truncate">{log.result}</td>
                      <td className="px-3.5 py-2 text-right">{statusBadge}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
