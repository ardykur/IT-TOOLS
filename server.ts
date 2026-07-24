import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini AI client getter
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory store for manifest & logs
let currentManifest = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString().split('T')[0],
  repository: 'https://github.com/pdsi-ict/ict-pdsi-utility',
  installerRootSSD: 'D:\\ICT_Tools\\Installers',
  logFilePath: 'C:\\ProgramData\\ICT_PDSI_Utility\\Logs\\activity.log',
  applications: [
    { id: 'office2019', name: 'Microsoft Office 2019 ProPlus', category: 'Productivity', silentArgs: '/configure configuration.xml', estimatedMB: 3200, mandatory: true },
    { id: 'm365', name: 'Microsoft 365 Apps for Enterprise', category: 'Productivity', silentArgs: 'setup.exe /download', estimatedMB: 3500, mandatory: false },
    { id: 'adobereader', name: 'Adobe Acrobat Reader DC', category: 'PDF & Docs', silentArgs: '/sAll /rs /msi EULA_ACCEPT=YES', estimatedMB: 350, mandatory: true },
    { id: 'chrome', name: 'Google Chrome Enterprise', category: 'Browser', silentArgs: '/silent /install', estimatedMB: 120, mandatory: true },
    { id: 'firefox', name: 'Mozilla Firefox Extended Support', category: 'Browser', silentArgs: '-ms', estimatedMB: 110, mandatory: false },
    { id: '7zip', name: '7-Zip 24.08 x64', category: 'Utility', silentArgs: '/S', estimatedMB: 5, mandatory: true },
    { id: 'pdf24', name: 'PDF24 Creator', category: 'PDF & Docs', silentArgs: '/SILENT /NORESTART', estimatedMB: 140, mandatory: false },
    { id: 'pdfsam', name: 'PDFSAM Basic', category: 'PDF & Docs', silentArgs: '/quiet', estimatedMB: 85, mandatory: false },
    { id: 'revpdf', name: 'RevPDF Reader & Converter', category: 'PDF & Docs', silentArgs: '/verysilent /norestart', estimatedMB: 45, mandatory: false },
    { id: 'sapgui', name: 'SAP GUI for Windows 8.00', category: 'Enterprise', silentArgs: '/Silent /Package="PDSI_Standard"', estimatedMB: 1200, mandatory: true },
    { id: 'arubavpn', name: 'Aruba VIA VPN Client', category: 'Network', silentArgs: '/qn /norestart', estimatedMB: 65, mandatory: true },
    { id: 'teams', name: 'Microsoft Teams (Work or School)', category: 'Communication', silentArgs: '-msi /qn', estimatedMB: 180, mandatory: true },
    { id: 'anydesk', name: 'AnyDesk Remote Control', category: 'Remote', silentArgs: '--install "C:\\Program Files (x86)\\AnyDesk" --start-with-win --silent', estimatedMB: 12, mandatory: false },
    { id: 'cortexxdr', name: 'Cortex XDR Agent (Palo Alto)', category: 'Security', silentArgs: '/qn /norestart', estimatedMB: 210, mandatory: true },
  ],
  networkDomain: {
    targetDomain: 'PDSI.CORP.LOCAL',
    preferredDNS: '10.10.1.10',
    alternateDNS: '10.10.1.11',
  },
};

let activityLogs: Array<{
  id: string;
  timestamp: string;
  user: string;
  computerName: string;
  action: string;
  result: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'IN_PROGRESS';
  details?: string;
}> = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: 'PDSI\\tech_admin',
    computerName: 'PDSI-WK-0842',
    action: 'Bootstrap Environment Check',
    result: 'PowerShell 5.1 & WPF Runtime validated successfully',
    status: 'SUCCESS',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    user: 'PDSI\\tech_admin',
    computerName: 'PDSI-WK-0842',
    action: 'Flush DNS & Reset Winsock',
    result: 'DNS Cache Flushed. Winsock catalog reset completed.',
    status: 'SUCCESS',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    user: 'PDSI\\tech_admin',
    computerName: 'PDSI-WK-0842',
    action: 'Install 7-Zip & Google Chrome',
    result: 'Exit code 0. Installed in C:\\Program Files\\7-Zip',
    status: 'SUCCESS',
  },
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), app: 'ICT PDSI Utility' });
});

app.get('/api/manifest', (req, res) => {
  res.json(currentManifest);
});

app.post('/api/manifest', (req, res) => {
  if (req.body && typeof req.body === 'object') {
    currentManifest = { ...currentManifest, ...req.body };
    res.json({ success: true, manifest: currentManifest });
  } else {
    res.status(400).json({ error: 'Invalid manifest payload' });
  }
});

app.get('/api/logs', (req, res) => {
  res.json(activityLogs);
});

app.post('/api/logs', (req, res) => {
  const { user, computerName, action, result, status, details } = req.body;
  const newLog = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    user: user || 'PDSI\\ICT_Technician',
    computerName: computerName || 'PDSI-WORKSTATION',
    action: action || 'Executed Command',
    result: result || 'Operation finished',
    status: status || 'SUCCESS',
    details,
  };
  activityLogs.unshift(newLog);
  res.json({ success: true, log: newLog });
});

// AI Technician Assistant via Gemini
app.post('/api/ai/assistant', async (req, res) => {
  try {
    const { query, systemInfo, category } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query prompt is required.' });
    }

    const ai = getAIClient();
    const systemPrompt = `You are the specialized ICT PDSI Technical Assistant for Windows 10/11 Enterprise Workstation Deployment.
You specialize in troubleshooting PowerShell 5.1 scripts, WPF UI, Windows Administration commands (sfc, dism, netsh, ipconfig, Add-Computer, Rename-Computer), SAP GUI deployment, Cortex XDR, Aruba VPN, and Domain Join issues for PDSI technicians.

Always give concise, direct, step-by-step actionable technician solutions, including exact PowerShell one-liners or CMD fixes where applicable.

Context provided by technician:
- Category: ${category || 'General ICT Troubleshooting'}
- System Info: ${JSON.stringify(systemInfo || {})}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    return res.json({ response: response.text });
  } catch (error: any) {
    console.error('Gemini AI Assistant Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate AI technical resolution.',
    });
  }
});

// AI PowerShell Script Generator
app.post('/api/ai/script-generator', async (req, res) => {
  try {
    const { requirements } = req.body;
    if (!requirements) {
      return res.status(400).json({ error: 'Requirements text is required.' });
    }

    const ai = getAIClient();
    const systemPrompt = `You are a Senior Windows PowerShell Automation Engineer creating PowerShell 5.1 modules compatible with WPF / XAML.
Generate clean, robust, error-handled PowerShell 5.1 code that uses UTF-8 logging, Write-Progress or Write-Verbose, and standard exit code handling for ICT deployment. Include inline comments. Return clear PowerShell code wrapped in markdown block.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a PowerShell 5.1 script module for ICT PDSI Utility based on these requirements:\n${requirements}`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    return res.json({ script: response.text });
  } catch (error: any) {
    console.error('Gemini Script Generator Error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate script.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ICT PDSI Utility] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
