import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { NavigationBar, NavigationTab } from './components/NavigationBar';
import { WpfGuiSimulatorTab } from './components/tabs/WpfGuiSimulatorTab';
import { SoftwareDeployerTab } from './components/tabs/SoftwareDeployerTab';
import { SystemToolsTab } from './components/tabs/SystemToolsTab';
import { TweaksTab } from './components/tabs/TweaksTab';
import { SystemInfoTab } from './components/tabs/SystemInfoTab';
import { ProjectExporterTab } from './components/tabs/ProjectExporterTab';
import { LogExplorerTab } from './components/tabs/LogExplorerTab';
import { AiAssistantTab } from './components/tabs/AiAssistantTab';
import { TerminalDrawer } from './components/TerminalDrawer';

import {
  DEFAULT_SOFTWARE_APPS,
  DEFAULT_SYSTEM_TOOLS,
  DEFAULT_SYSTEM_TWEAKS,
  MOCK_SYSTEM_INFO,
  INITIAL_PROJECT_FILES,
} from './data/pdsiData';
import { SoftwareApp, SystemTool, SystemTweak, SystemInformation, ProjectFile, ExecutionLog } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('wpf_gui');
  const [theme, setTheme] = useState<'wpf_dark' | 'wpf_light' | 'wpf_classic'>('wpf_dark');

  const [apps, setApps] = useState<SoftwareApp[]>(DEFAULT_SOFTWARE_APPS);
  const [tools] = useState<SystemTool[]>(DEFAULT_SYSTEM_TOOLS);
  const [tweaks] = useState<SystemTweak[]>(DEFAULT_SYSTEM_TWEAKS);
  const [systemInfo, setSystemInfo] = useState<SystemInformation>(MOCK_SYSTEM_INFO);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(INITIAL_PROJECT_FILES);
  
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] PS C:\\> Import-Module .\\Bootstrap.ps1 -Verbose`,
    `[+] ICT PDSI Utility v1.0.0 initialized on ${MOCK_SYSTEM_INFO.network.hostname}`,
    `[+] SSD Media Path: D:\\ICT_Tools\\Installers verified.`,
    `[+] Active Directory Context: ${MOCK_SYSTEM_INFO.domain.domainName} (${MOCK_SYSTEM_INFO.domain.domainStatus})`,
  ]);

  const [isExecuting, setIsExecuting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch initial logs and manifest from server
  useEffect(() => {
    fetch('/api/logs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLogs(data);
        }
      })
      .catch((err) => console.log('Using local initial log state:', err));

    fetch('/api/manifest')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.applications) {
          // Sync apps from manifest if present
          console.log('[ICT PDSI Utility] Synchronized manifest configuration.');
        }
      })
      .catch((err) => console.log('Using local manifest state:', err));
  }, []);

  // Helper to record a new log
  const recordLog = async (
    action: string,
    result: string,
    status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'IN_PROGRESS',
    details?: string
  ) => {
    const timestamp = new Date().toISOString();
    const newEntry: ExecutionLog = {
      id: Date.now().toString(),
      timestamp,
      user: systemInfo.domain.currentUser,
      computerName: systemInfo.network.hostname,
      action,
      result,
      status,
      details,
    };

    setLogs((prev) => [newEntry, ...prev]);

    // Stream terminal line
    const formattedLine = `[${new Date().toLocaleTimeString()}] ${status === 'SUCCESS' ? '[+]' : '[!]'} ${action}: ${result}`;
    setTerminalLogs((prev) => [...prev, formattedLine]);

    // Sync to backend
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch (e) {
      console.error('Failed to sync log to server:', e);
    }
  };

  // Toggle software selection state
  const handleToggleApp = (appId: string) => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const nextStatus = a.status === 'not_installed' ? 'queued' : a.status === 'queued' ? 'not_installed' : a.status;
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
  };

  // Update silent arguments for software
  const handleUpdateAppArgs = (appId: string, newArgs: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, silentArgs: newArgs } : a))
    );
    recordLog(`Update Silent Args (${appId})`, `Set flags: ${newArgs}`, 'SUCCESS');
  };

  // Batch run software installer queue
  const handleRunBatchInstall = async (appIds: string[]) => {
    if (appIds.length === 0 || isExecuting) return;
    setIsExecuting(true);

    const appNames = apps.filter((a) => appIds.includes(a.id)).map((a) => a.name).join(', ');
    await recordLog('Start Software Batch Installation', `Installing packages: ${appNames}`, 'IN_PROGRESS');

    for (const id of appIds) {
      const targetApp = apps.find((a) => a.id === id);
      if (!targetApp) continue;

      // Update status to installing
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'installing' } : a)));

      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Start-Process -FilePath "D:\\ICT_Tools\\Installers\\${targetApp.installerFileName}" -ArgumentList "${targetApp.silentArgs}" -Wait`,
      ]);

      // Simulate installation delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mark installed
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'installed' } : a)));

      await recordLog(
        `Install Package: ${targetApp.name}`,
        `Exit code 0. Installed from D:\\ICT_Tools\\Installers\\${targetApp.installerFileName}`,
        'SUCCESS'
      );
    }

    setIsExecuting(false);
  };

  // Single app install
  const handleInstallSingleApp = (appId: string) => {
    handleRunBatchInstall([appId]);
  };

  // Run a system tool command
  const handleRunTool = async (toolId: string, param1?: string, param2?: string) => {
    if (isExecuting) return;
    const toolObj = tools.find((t) => t.id === toolId);
    if (!toolObj) return;

    setIsExecuting(true);

    let actualCmd = toolObj.psCommand;
    if (toolObj.requiresParams) {
      actualCmd = actualCmd.replace('{param1}', param1 || toolObj.paramDefault || '');
      if (toolObj.secondParamLabel) {
        actualCmd = actualCmd.replace('{param2}', param2 || toolObj.secondParamDefault || '');
      }
    }

    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] PS C:\\> ${actualCmd}`,
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Handle side effects on system info state if rename or domain join
    if (toolId === 'rename_hostname' && param1) {
      setSystemInfo((prev) => ({
        ...prev,
        network: { ...prev.network, hostname: param1.toUpperCase() },
      }));
    } else if (toolId === 'join_domain' && param1) {
      setSystemInfo((prev) => ({
        ...prev,
        domain: { ...prev.domain, domainName: param1.toUpperCase(), domainStatus: 'Domain Joined' },
      }));
    }

    await recordLog(
      `Tool: ${toolObj.name}`,
      `Command executed successfully: ${actualCmd}`,
      'SUCCESS'
    );

    setIsExecuting(false);
  };

  // Run a tweak
  const handleRunTweak = async (tweakId: string) => {
    if (isExecuting) return;
    const tweakObj = tweaks.find((t) => t.id === tweakId);
    if (!tweakObj) return;

    setIsExecuting(true);

    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] PS C:\\> ${tweakObj.psCommand.split('\n')[0]}`,
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await recordLog(
      `Tweak: ${tweakObj.name}`,
      `Applied optimization. ${tweakObj.description}`,
      'SUCCESS'
    );

    setIsExecuting(false);
  };

  // Batch run tweaks
  const handleRunBatchTweaks = async (tweakIds: string[]) => {
    if (tweakIds.length === 0 || isExecuting) return;
    for (const id of tweakIds) {
      await handleRunTweak(id);
    }
  };

  // Update file content in project structure
  const handleUpdateFileContent = (path: string, newContent: string) => {
    setProjectFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content: newContent } : f))
    );
    recordLog(`Edit Source File`, `Updated file contents of ${path}`, 'SUCCESS');
  };

  // Quick GitHub Sync simulation
  const handleQuickSync = async () => {
    setIsSyncing(true);
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] git fetch origin main --verbose`,
      `[*] Checking GitHub repo: https://github.com/pdsi-ict/ict-pdsi-utility...`,
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setTerminalLogs((prev) => [
      ...prev,
      `[+] Source repository is up-to-date with latest commit (v1.0.0).`,
    ]);

    recordLog('GitHub Repository Sync', 'Manifest and PowerShell scripts up-to-date', 'SUCCESS');
    setIsSyncing(false);
  };

  // Add a test audit log
  const handleAddTestLog = () => {
    recordLog(
      'Manual Diagnostic Verification',
      'Tested workstation responsiveness & memory state',
      'SUCCESS'
    );
  };

  const pendingInstallCount = apps.filter((a) => a.status === 'queued').length;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-200 font-sans pb-24 flex flex-col">
      {/* Top Header Bar */}
      <HeaderBar
        systemInfo={systemInfo}
        activeTheme={theme}
        onThemeChange={setTheme}
        onQuickSync={handleQuickSync}
        isSyncing={isSyncing}
      />

      {/* Main Tab Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingInstallCount={pendingInstallCount}
        logCount={logs.length}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-5 space-y-5 bg-[#0D0F14]">
        {activeTab === 'wpf_gui' && (
          <WpfGuiSimulatorTab
            apps={apps}
            tools={tools}
            tweaks={tweaks}
            systemInfo={systemInfo}
            onToggleApp={handleToggleApp}
            onRunBatchInstall={handleRunBatchInstall}
            onRunTool={handleRunTool}
            onRunTweak={handleRunTweak}
            terminalLogs={terminalLogs}
            isExecuting={isExecuting}
            theme={theme}
          />
        )}

        {activeTab === 'installers' && (
          <SoftwareDeployerTab
            apps={apps}
            onToggleApp={handleToggleApp}
            onUpdateAppArgs={handleUpdateAppArgs}
            onRunBatchInstall={handleRunBatchInstall}
            onInstallSingleApp={handleInstallSingleApp}
            isExecuting={isExecuting}
          />
        )}

        {activeTab === 'tools' && (
          <SystemToolsTab
            tools={tools}
            onRunTool={handleRunTool}
            isExecuting={isExecuting}
          />
        )}

        {activeTab === 'tweaks' && (
          <TweaksTab
            tweaks={tweaks}
            onRunTweak={handleRunTweak}
            onRunBatchTweaks={handleRunBatchTweaks}
            isExecuting={isExecuting}
          />
        )}

        {activeTab === 'sys_info' && (
          <SystemInfoTab
            systemInfo={systemInfo}
            onRefreshInfo={() => recordLog('WMI Rescan', 'Refreshed system hardware & network state', 'SUCCESS')}
          />
        )}

        {activeTab === 'project_files' && (
          <ProjectExporterTab
            files={projectFiles}
            onUpdateFileContent={handleUpdateFileContent}
          />
        )}

        {activeTab === 'logs' && (
          <LogExplorerTab
            logs={logs}
            onClearLogs={() => setLogs([])}
            onAddTestLog={handleAddTestLog}
          />
        )}

        {activeTab === 'ai_assistant' && (
          <AiAssistantTab systemInfo={systemInfo} />
        )}
      </main>

      {/* High Density Status Footer */}
      <footer className="h-8 bg-[#16191F] border-t border-slate-800 flex items-center justify-between px-4 text-[10px] text-slate-500 font-mono select-none">
        <div className="flex items-center space-x-4">
          <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>DISK: ONLINE (D:\ICT_Tools)</span>
          <span className="text-slate-800">|</span>
          <span>MANIFEST: SYNCED</span>
          <span className="text-slate-800">|</span>
          <span>LOGGING: UTF-8 ENABLED</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>{isExecuting ? 'EXECUTING QUEUE' : 'SYSTEM IDLE'}</span>
          <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full ${isExecuting ? 'bg-blue-500 animate-pulse w-[85%]' : 'bg-emerald-500 w-[100%]'}`} />
          </div>
        </div>
      </footer>

      {/* Collapsible PowerShell 5.1 Terminal Drawer */}
      <TerminalDrawer logs={terminalLogs} onClear={() => setTerminalLogs([])} />
    </div>
  );
}
