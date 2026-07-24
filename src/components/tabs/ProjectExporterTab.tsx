import React, { useState } from 'react';
import { ProjectFile } from '../../types';
import { FolderTree, FileCode, Download, Copy, Check, Save, Edit3, Folder, Archive, FileJson, FileText, CheckCircle2 } from 'lucide-react';
import JSZip from 'jszip';

interface ProjectExporterTabProps {
  files: ProjectFile[];
  onUpdateFileContent: (path: string, newContent: string) => void;
}

export const ProjectExporterTab: React.FC<ProjectExporterTabProps> = ({
  files,
  onUpdateFileContent,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(files[0]?.path || 'Launcher.ps1');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const selectedFile = files.find((f) => f.path === selectedFilePath) || files[0];
  const [editedContent, setEditedContent] = useState<string>(selectedFile?.content || '');

  const handleSelectFile = (file: ProjectFile) => {
    setSelectedFilePath(file.path);
    setEditedContent(file.content);
    setIsSaved(false);
  };

  const handleSaveEdit = () => {
    if (selectedFile) {
      onUpdateFileContent(selectedFile.path, editedContent);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    if (!selectedFile) return;
    const blob = new Blob([editedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all files with appropriate folder paths
      files.forEach((file) => {
        const contentToSave = file.path === selectedFile.path ? editedContent : file.content;
        zip.file(file.path, contentToSave);
      });

      // Add empty folders specified in SRS Section 7
      zip.folder('Assets');
      zip.folder('Legacy');

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ICT_PDSI_Utility_v1.0.0_Source.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating ZIP archive:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Group files by folder
  const folderGroups: Record<string, ProjectFile[]> = {};
  files.forEach((file) => {
    if (!folderGroups[file.folder]) {
      folderGroups[file.folder] = [];
    }
    folderGroups[file.folder].push(file);
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#16191F] p-4 rounded border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-100">Modular PowerShell 5.1 &amp; WPF Source Structure</h2>
            <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 text-[10px] font-mono border border-indigo-700/50">
              Section 7 - SRS Architecture
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">
            Launcher.ps1 -&gt; Manifest.json -&gt; Bootstrap.ps1 -&gt; Main.ps1 -&gt; Main.xaml -&gt; Modules (.psm1).
          </p>
        </div>

        <button
          onClick={handleExportZip}
          disabled={isZipping}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow-md transition disabled:opacity-50 uppercase tracking-wider"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{isZipping ? 'Packaging ZIP...' : 'Download Full Project ZIP'}</span>
        </button>
      </div>

      {/* Main File Explorer & Code Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Tree Explorer (1/4) */}
        <div className="bg-[#16191F] border border-slate-800 rounded p-3 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FolderTree className="w-3.5 h-3.5 text-blue-400" />
              <span>Project Files</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">{files.length} items</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(folderGroups).map(([folderName, folderFiles]) => (
              <div key={folderName} className="space-y-1">
                <div className="flex items-center space-x-1.5 text-slate-400 font-semibold text-[10px] uppercase font-mono px-1 py-0.5">
                  <Folder className="w-3 h-3 text-amber-400" />
                  <span>{folderName === 'Root' ? 'Project Root (/) ' : `${folderName}/`}</span>
                </div>

                <div className="pl-2 space-y-0.5 border-l border-slate-800 ml-1.5">
                  {folderFiles.map((file) => {
                    const isSelected = file.path === selectedFilePath;
                    const Icon = file.language === 'json' ? FileJson : file.language === 'xml' ? FileText : FileCode;

                    return (
                      <button
                        key={file.path}
                        onClick={() => handleSelectFile(file)}
                        className={`w-full text-left px-2 py-1 rounded flex items-center justify-between transition text-[11px] font-mono ${
                          isSelected
                            ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/50'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="flex items-center space-x-1.5 truncate">
                          <Icon className={`w-3 h-3 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                          <span className="truncate">{file.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Empty required folders */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80 font-mono text-[10px]">
              <div className="flex items-center space-x-1.5 text-slate-500 px-1">
                <Folder className="w-3 h-3 text-slate-600" />
                <span>Assets/ (Branding)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-500 px-1">
                <Folder className="w-3 h-3 text-slate-600" />
                <span>Legacy/ (Archive)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Code Editor & Description (3/4) */}
        <div className="lg:col-span-3 bg-[#16191F] border border-slate-800 rounded p-4 shadow-md flex flex-col justify-between space-y-3">
          <div>
            {/* File Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0A0C10] p-2.5 rounded border border-slate-800 mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold font-mono text-blue-300">{selectedFile.path}</span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {selectedFile.language}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-semibold transition"
                >
                  {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaved ? 'Saved!' : 'Save'}</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadSingleFile}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Text Editor Textarea */}
            <div className="relative">
              <textarea
                value={editedContent}
                onChange={(e) => {
                  setEditedContent(e.target.value);
                  setIsSaved(false);
                }}
                spellCheck={false}
                rows={18}
                className="w-full bg-[#0A0C10] text-slate-200 font-mono text-xs p-3.5 rounded border border-slate-800 leading-relaxed focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 resize-y"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>UTF-8 Encoding | Windows CR-LF Compatible</span>
            <span>Path: D:\ICT_Tools\{selectedFile.path}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
