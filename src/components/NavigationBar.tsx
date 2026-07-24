import React from 'react';
import { Download, Wrench, Sliders, Info, FolderTree, FileText, Bot, Monitor } from 'lucide-react';

export type NavigationTab = 
  | 'wpf_gui'
  | 'installers'
  | 'tools'
  | 'tweaks'
  | 'sys_info'
  | 'project_files'
  | 'logs'
  | 'ai_assistant';

interface NavigationBarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  pendingInstallCount: number;
  logCount: number;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onTabChange,
  pendingInstallCount,
  logCount,
}) => {
  const tabs = [
    {
      id: 'wpf_gui' as NavigationTab,
      num: '01',
      label: 'Deployment GUI',
      icon: Monitor,
      badge: null,
    },
    {
      id: 'installers' as NavigationTab,
      num: '02',
      label: 'Software Queue',
      icon: Download,
      badge: pendingInstallCount > 0 ? `${pendingInstallCount}` : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'tools' as NavigationTab,
      num: '03',
      label: 'Admin Tools',
      icon: Wrench,
      badge: null,
    },
    {
      id: 'tweaks' as NavigationTab,
      num: '04',
      label: 'OS Tweaks',
      icon: Sliders,
      badge: null,
    },
    {
      id: 'sys_info' as NavigationTab,
      num: '05',
      label: 'System Info',
      icon: Info,
      badge: null,
    },
    {
      id: 'project_files' as NavigationTab,
      num: '06',
      label: 'Source & ZIP',
      icon: FolderTree,
      badge: 'PS5.1',
      badgeColor: 'bg-indigo-900/80 text-indigo-200 border border-indigo-700',
    },
    {
      id: 'logs' as NavigationTab,
      num: '07',
      label: 'Audit Logs',
      icon: FileText,
      badge: `${logCount}`,
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700',
    },
    {
      id: 'ai_assistant' as NavigationTab,
      num: '08',
      label: 'AI Diagnostic',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <nav className="bg-[#111419] border-b border-slate-800 px-4 pt-1.5 flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex overflow-x-auto no-scrollbar space-x-1 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-t text-xs font-medium transition whitespace-nowrap border-t border-x ${
                isActive
                  ? 'bg-[#16191F] text-white border-t-2 border-t-blue-500 border-x-slate-800 border-b-transparent shadow-sm'
                  : 'bg-[#111419] text-slate-400 hover:text-white hover:bg-slate-800/60 border-transparent'
              }`}
            >
              <span className={`italic font-serif text-[11px] ${isActive ? 'text-blue-400 opacity-90' : 'opacity-40'}`}>
                {tab.num}
              </span>
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    tab.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
