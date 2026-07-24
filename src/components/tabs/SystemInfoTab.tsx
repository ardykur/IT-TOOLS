import React, { useState } from 'react';
import { SystemInformation } from '../../types';
import { Cpu, HardDrive, Monitor, Network, ShieldCheck, Copy, Check, Download, FileText, Activity } from 'lucide-react';

interface SystemInfoTabProps {
  systemInfo: SystemInformation;
  onRefreshInfo: () => void;
}

export const SystemInfoTab: React.FC<SystemInfoTabProps> = ({
  systemInfo,
  onRefreshInfo,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'hardware' | 'os' | 'office' | 'network' | 'domain'>('all');
  const [copied, setCopied] = useState(false);

  const exportSummary = () => {
    const text = `================================================================
ICT PDSI UTILITY - WORKSTATION DIAGNOSTIC REPORT
Generated: ${new Date().toLocaleString()}
================================================================

[HARDWARE DIAGNOSTICS]
CPU:            ${systemInfo.hardware.cpu} (${systemInfo.hardware.coresThreads})
RAM:            ${systemInfo.hardware.ramInstalled} @ ${systemInfo.hardware.ramSpeed}
Motherboard:    ${systemInfo.hardware.motherboard}
GPU:            ${systemInfo.hardware.gpu}
Serial Number:  ${systemInfo.hardware.serialNumber}
Disks:          ${systemInfo.hardware.disks.map(d => `${d.drive} ${d.type} (${d.freeGB}GB free of ${d.totalGB}GB)`).join(' | ')}

[OPERATING SYSTEM]
Edition:        ${systemInfo.os.edition}
Build:          ${systemInfo.os.versionBuild}
Architecture:   ${systemInfo.os.architecture}
Install Date:   ${systemInfo.os.installDate}
Uptime:         ${systemInfo.os.uptime}
Last Boot:      ${systemInfo.os.lastBoot}

[MICROSOFT OFFICE]
Product:        ${systemInfo.office.installedProduct}
Version:        ${systemInfo.office.version}
License:        ${systemInfo.office.licenseType} (${systemInfo.office.licenseStatus})

[NETWORK ADAPTER]
Hostname:       ${systemInfo.network.hostname}
Adapter:        ${systemInfo.network.adapterName}
IPv4:           ${systemInfo.network.ipv4Address}
Subnet Mask:    ${systemInfo.network.subnetMask}
Gateway:        ${systemInfo.network.defaultGateway}
MAC Address:    ${systemInfo.network.macAddress}
DNS Servers:    ${systemInfo.network.dnsServers.join(', ')}
Link Speed:     ${systemInfo.network.linkSpeed}

[DOMAIN & ACTIVE DIRECTORY]
Domain:         ${systemInfo.domain.domainName} (${systemInfo.domain.domainStatus})
Logged User:    ${systemInfo.domain.currentUser}
DC Server:      ${systemInfo.domain.domainController}
OU Path:        ${systemInfo.domain.organizationalUnit}
================================================================
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#16191F] p-4 rounded border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">Workstation Information &amp; Audit Report</h2>
            <span className="px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 text-[10px] font-mono border border-sky-700/50">
              Phase 7 - SRS Spec
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Real-time WMI/CIM query snapshot for Hardware, Operating System, Office installation, Network, and Active Directory Domain.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportSummary}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={onRefreshInfo}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition shadow-sm uppercase tracking-wider"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Re-Query WMI</span>
          </button>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex overflow-x-auto space-x-1.5 bg-[#111419] p-2 rounded border border-slate-800 text-xs no-scrollbar">
        {[
          { id: 'all', label: 'All Modules' },
          { id: 'hardware', label: 'Hardware' },
          { id: 'os', label: 'Operating System' },
          { id: 'office', label: 'Microsoft Office' },
          { id: 'network', label: 'Network Adapter' },
          { id: 'domain', label: 'Domain & AD' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as any)}
            className={`px-3 py-1 rounded font-medium text-xs transition whitespace-nowrap ${
              activeSection === sec.id
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Hardware Info Card */}
        {(activeSection === 'all' || activeSection === 'hardware') && (
          <div className="bg-[#16191F] border border-slate-800 rounded p-4 shadow-md space-y-3">
            <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-800">
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">Hardware Components</h3>
                <p className="text-[10px] text-slate-500 font-mono">Processor, RAM, Disks, Motherboard, GPU</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Processor (CPU):</span>
                <span className="font-semibold text-slate-200 text-right">{systemInfo.hardware.cpu}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Cores / Threads:</span>
                <span className="font-mono text-blue-400">{systemInfo.hardware.coresThreads}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">RAM Installed:</span>
                <span className="font-semibold text-slate-200">{systemInfo.hardware.ramInstalled} ({systemInfo.hardware.ramSpeed})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Motherboard:</span>
                <span className="text-slate-300">{systemInfo.hardware.motherboard}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">GPU Adapter:</span>
                <span className="text-slate-300">{systemInfo.hardware.gpu}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Service Tag / S/N:</span>
                <span className="font-mono text-amber-300 font-bold">{systemInfo.hardware.serialNumber}</span>
              </div>

              {/* Disk Drives */}
              <div className="pt-1.5">
                <span className="text-slate-400 block mb-1 font-mono text-[10px] uppercase">Storage Volumes:</span>
                <div className="space-y-1.5">
                  {systemInfo.hardware.disks.map((d, i) => (
                    <div key={i} className="bg-[#0A0C10] p-2 rounded border border-slate-800 space-y-1">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="font-bold text-blue-300">{d.drive} ({d.type})</span>
                        <span className="text-emerald-400">{d.freeGB} GB Free / {d.totalGB} GB</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${((d.totalGB - d.freeGB) / d.totalGB) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. OS Info Card */}
        {(activeSection === 'all' || activeSection === 'os') && (
          <div className="bg-[#16191F] border border-slate-800 rounded p-4 shadow-md space-y-3">
            <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-800">
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">Operating System</h3>
                <p className="text-[10px] text-slate-500 font-mono">Windows Edition, Build, Architecture, Boot Uptime</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Windows Edition:</span>
                <span className="font-bold text-blue-300">{systemInfo.os.edition}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Build Version:</span>
                <span className="font-mono text-slate-300">{systemInfo.os.versionBuild}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Architecture:</span>
                <span className="text-slate-300">{systemInfo.os.architecture}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">OS Install Date:</span>
                <span className="font-mono text-slate-300">{systemInfo.os.installDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">System Uptime:</span>
                <span className="font-semibold text-emerald-400 font-mono">{systemInfo.os.uptime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Last Cold Boot:</span>
                <span className="font-mono text-slate-300">{systemInfo.os.lastBoot}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Office Info Card */}
        {(activeSection === 'all' || activeSection === 'office') && (
          <div className="bg-[#16191F] border border-slate-800 rounded p-4 shadow-md space-y-3">
            <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-800">
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">Microsoft Office Suite</h3>
                <p className="text-[10px] text-slate-500 font-mono">Installed Version, KMS Activation &amp; Channel</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Installed Product:</span>
                <span className="font-bold text-indigo-300">{systemInfo.office.installedProduct}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Build Version:</span>
                <span className="font-mono text-slate-300">{systemInfo.office.version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Architecture:</span>
                <span className="text-slate-300">{systemInfo.office.architecture}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">License Channel:</span>
                <span className="text-slate-300">{systemInfo.office.licenseType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Activation Status:</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 font-bold text-[9px] border border-emerald-700 font-mono">
                  {systemInfo.office.licenseStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Network Info Card */}
        {(activeSection === 'all' || activeSection === 'network') && (
          <div className="bg-[#16191F] border border-slate-800 rounded p-4 shadow-md space-y-3">
            <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-800">
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">Network Adapter &amp; IP Config</h3>
                <p className="text-[10px] text-slate-500 font-mono">Ethernet Interface, Gateway, Subnet &amp; DNS</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Computer Hostname:</span>
                <span className="font-mono font-bold text-blue-300">{systemInfo.network.hostname}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Active NIC:</span>
                <span className="text-slate-300 text-right">{systemInfo.network.adapterName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">IPv4 Address:</span>
                <span className="font-mono text-emerald-400 font-bold">{systemInfo.network.ipv4Address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Subnet Mask:</span>
                <span className="font-mono text-slate-300">{systemInfo.network.subnetMask}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Default Gateway:</span>
                <span className="font-mono text-slate-300">{systemInfo.network.defaultGateway}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">MAC Address:</span>
                <span className="font-mono text-slate-300">{systemInfo.network.macAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">DNS Servers:</span>
                <span className="font-mono text-blue-300">{systemInfo.network.dnsServers.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Link Speed:</span>
                <span className="text-slate-300">{systemInfo.network.linkSpeed}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Domain & AD Info Card */}
        {(activeSection === 'all' || activeSection === 'domain') && (
          <div className="bg-[#16191F] border border-slate-800 rounded p-4 shadow-md space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5 pb-2.5 border-b border-slate-800">
              <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">Domain &amp; Active Directory Context</h3>
                <p className="text-[10px] text-slate-500 font-mono">Domain Join Status, OU Path, DC Server, User Principal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Target AD Domain:</span>
                  <span className="font-bold text-purple-300">{systemInfo.domain.domainName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Domain Join Status:</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-200 font-semibold text-[9px] border border-purple-700 font-mono">
                    {systemInfo.domain.domainStatus}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Logged User:</span>
                  <span className="font-mono text-blue-300 font-bold">{systemInfo.domain.currentUser}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Domain Controller:</span>
                  <span className="font-mono text-slate-300">{systemInfo.domain.domainController}</span>
                </div>
                <div className="py-1 border-b border-slate-800/60">
                  <span className="text-slate-400 block mb-1">Organizational Unit (OU Path):</span>
                  <code className="text-[10px] text-amber-300 bg-[#0A0C10] p-1.5 rounded block truncate font-mono border border-slate-800">
                    {systemInfo.domain.organizationalUnit}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
