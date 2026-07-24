import React, { useState } from 'react';
import { Bot, Send, Sparkles, Terminal, Code, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { SystemInformation } from '../../types';

interface AiAssistantTabProps {
  systemInfo: SystemInformation;
}

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({ systemInfo }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Domain Join & Active Directory');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello ICT Technician! I am your AI Diagnostic Assistant for **ICT PDSI Utility**.
I can assist you with:
- Troubleshooting Windows 10/11 Active Directory domain join errors (e.g., Error 1326, 1355, 1722).
- Crafting silent installation arguments for enterprise software (SAP GUI 8.00, Cortex XDR, Aruba VIA VPN).
- Debugging PowerShell 5.1 & WPF WPF XAML scripts.
- Resolving network connection, Winsock, DNS, or SFC/DISM component corruptions.

Select a preset question below or type your technical query!`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const presetQueries = [
    { label: 'Domain Join Error 1326 Fix', cat: 'Domain Join & Active Directory', text: 'How do I resolve Active Directory Domain Join Error 1326 (Logon failure: unknown user name or bad password) in PowerShell 5.1?' },
    { label: 'SAP GUI 8.00 Silent Install Switch', cat: 'Software Installation', text: 'What is the exact silent install command line and package setup for SAP GUI for Windows 8.00 in enterprise deployment?' },
    { label: 'SFC & DISM Repair Sequence', cat: 'Windows Maintenance', text: 'What is the recommended PowerShell sequence to repair corrupt Windows 11 system files using SFC and DISM?' },
    { label: 'Flush DNS & Reset Winsock One-liner', cat: 'Network Troubleshooting', text: 'Provide a PowerShell 5.1 script to reset Winsock catalog, release/renew IP, and clear DNS cache safely.' },
  ];

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || query;
    if (!promptText.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, text: promptText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptText,
          category,
          systemInfo: {
            hostname: systemInfo.network.hostname,
            domain: systemInfo.domain.domainName,
            os: systemInfo.os.edition,
          },
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: `Error: ${data.error || 'Failed to get AI resolution.'}` },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Failed to connect to AI server endpoint: ${err?.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#16191F] p-4 rounded border border-slate-800 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">ICT AI Diagnostic &amp; Scripting Assistant</h2>
            <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[10px] font-mono border border-emerald-700/50">
              Gemini 3.6 Flash Server-Side
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Intelligent troubleshooting helper for ICT technicians handling Windows 10/11 deployments, domain joins, and PowerShell automation.
          </p>
        </div>
      </div>

      {/* Preset Query Chips */}
      <div className="flex overflow-x-auto space-x-1.5 bg-[#111419] p-2.5 rounded border border-slate-800 no-scrollbar">
        {presetQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCategory(item.cat);
              handleSend(item.text);
            }}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#16191F] border border-slate-800 rounded p-4 shadow-md space-y-3 min-h-[380px] max-h-[500px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start space-x-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-2xl p-3 rounded text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none font-sans'
                  : 'bg-[#0A0C10] border border-slate-800 text-slate-200 rounded-tl-none font-sans whitespace-pre-wrap'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                <Terminal className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono animate-pulse">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Assistant is analyzing query and generating PowerShell code...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          placeholder="Ask AI about domain join errors, silent install parameters, or PowerShell scripts..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 bg-[#0A0C10] border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !query.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs flex items-center space-x-1.5 shadow-md transition disabled:opacity-50 uppercase tracking-wider"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
