export type AppCategory = 
  | 'Productivity'
  | 'PDF & Docs'
  | 'Browser'
  | 'Enterprise'
  | 'Network'
  | 'Communication'
  | 'Remote'
  | 'Security'
  | 'Utility';

export type InstallStatus = 'not_installed' | 'queued' | 'installing' | 'installed' | 'failed';

export interface SoftwareApp {
  id: string;
  name: string;
  category: AppCategory;
  version: string;
  silentArgs: string;
  estimatedMB: number;
  mandatory: boolean;
  description: string;
  installerFileName: string;
  iconName: string;
  status: InstallStatus;
  progress?: number;
  outputLog?: string;
}

export interface SystemTool {
  id: string;
  name: string;
  category: 'Network' | 'Domain' | 'System Admin' | 'Utilities';
  description: string;
  iconName: string;
  psCommand: string;
  requiresParams?: boolean;
  paramLabel?: string;
  paramPlaceholder?: string;
  paramDefault?: string;
  secondParamLabel?: string;
  secondParamPlaceholder?: string;
  secondParamDefault?: string;
}

export interface SystemTweak {
  id: string;
  name: string;
  category: 'Disk & Maintenance' | 'System Integrity' | 'Explorer & UI' | 'Performance & Power';
  description: string;
  psCommand: string;
  risk: 'Safe' | 'Moderate' | 'High';
  recommended: boolean;
  status?: 'idle' | 'running' | 'applied' | 'failed';
}

export interface SystemInfoHardware {
  cpu: string;
  coresThreads: string;
  ramInstalled: string;
  ramSpeed: string;
  disks: Array<{ drive: string; type: string; totalGB: number; freeGB: number }>;
  motherboard: string;
  gpu: string;
  serialNumber: string;
}

export interface SystemInfoOS {
  edition: string;
  versionBuild: string;
  architecture: string;
  installDate: string;
  uptime: string;
  lastBoot: string;
}

export interface SystemInfoOffice {
  installedProduct: string;
  version: string;
  architecture: string;
  licenseType: string;
  licenseStatus: string;
}

export interface SystemInfoNetwork {
  hostname: string;
  adapterName: string;
  ipv4Address: string;
  subnetMask: string;
  defaultGateway: string;
  macAddress: string;
  dnsServers: string[];
  linkSpeed: string;
}

export interface SystemInfoDomain {
  domainName: string;
  domainStatus: 'Domain Joined' | 'Workgroup';
  currentUser: string;
  domainController: string;
  organizationalUnit: string;
}

export interface SystemInformation {
  hardware: SystemInfoHardware;
  os: SystemInfoOS;
  office: SystemInfoOffice;
  network: SystemInfoNetwork;
  domain: SystemInfoDomain;
}

export interface ProjectFile {
  path: string;
  name: string;
  folder: 'Root' | 'Assets' | 'Config' | 'Modules' | 'Xaml' | 'Legacy';
  content: string;
  language: 'powershell' | 'json' | 'xml';
  description: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  user: string;
  computerName: string;
  action: string;
  result: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'IN_PROGRESS';
  details?: string;
}

export interface ManifestConfig {
  version: string;
  lastUpdated: string;
  repository: string;
  installerRootSSD: string;
  logFilePath: string;
  applications: SoftwareApp[];
  networkDomain: {
    targetDomain: string;
    preferredDNS: string;
    alternateDNS: string;
  };
}
