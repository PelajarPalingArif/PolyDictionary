/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  HardDriveDownload, 
  Check, 
  Trash2, 
  Download, 
  Upload, 
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { CorpusPackage, DictionaryEntry } from '../types/dictionary';
import { 
  getCorpusPackages, 
  installCorpusPackage, 
  uninstallCorpusPackage,
  getCustomEntries,
  saveCustomEntries
} from '../services/corpusStorage';

interface CorpusManagerViewProps {
  onCorpusUpdated: () => void;
}

export const CorpusManagerView: React.FC<CorpusManagerViewProps> = ({ onCorpusUpdated }) => {
  const [packages, setPackages] = useState<CorpusPackage[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [customWord, setCustomWord] = useState('');
  const [customDef, setCustomDef] = useState('');
  const [customPos, setCustomPos] = useState<'noun' | 'verb' | 'adjective' | 'financial'>('noun');
  const [customEntriesList, setCustomEntriesList] = useState<DictionaryEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = () => {
    setPackages(getCorpusPackages());
    setCustomEntriesList(getCustomEntries());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDownload = async (pkg: CorpusPackage) => {
    setDownloadingId(pkg.id);
    setDownloadProgress(15);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    const result = await installCorpusPackage(pkg.id);
    clearInterval(interval);
    setDownloadProgress(100);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadProgress(0);
      loadData();
      onCorpusUpdated();
      showToast(`Installed ${pkg.name} (${result.entriesAdded} entries ready offline)`);
    }, 300);
  };

  const handleUninstall = (pkg: CorpusPackage) => {
    if (pkg.isDefault) return;
    uninstallCorpusPackage(pkg.id);
    loadData();
    onCorpusUpdated();
    showToast(`Removed ${pkg.name} from local storage`);
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWord.trim() || !customDef.trim()) return;

    const newEntry: DictionaryEntry = {
      id: `custom-${Date.now()}`,
      word: customWord.trim(),
      language: 'en',
      corpusId: 'custom-user-corpus',
      corpusName: 'Personal Vocabulary',
      isCustom: true,
      meanings: [
        {
          partOfSpeech: customPos,
          definitions: [customDef.trim()],
          examples: ['User custom dictionary entry.'],
          synonyms: [],
          antonyms: []
        }
      ]
    };

    const current = getCustomEntries();
    const updated = [newEntry, ...current];
    saveCustomEntries(updated);
    setCustomEntriesList(updated);
    setCustomWord('');
    setCustomDef('');
    onCorpusUpdated();
    showToast(`Added "${newEntry.word}" to offline dictionary!`);
  };

  const handleRemoveCustomEntry = (id: string) => {
    const current = getCustomEntries();
    const updated = current.filter(e => e.id !== id);
    saveCustomEntries(updated);
    setCustomEntriesList(updated);
    onCorpusUpdated();
  };

  const installedCount = packages.filter(p => p.installed).length;
  const totalEntries = packages
    .filter(p => p.installed)
    .reduce((acc, p) => acc + p.entryCount, customEntriesList.length);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-150">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
          <div>
            <div className="flex items-center gap-2">
              <HardDriveDownload className="w-5 h-5 text-[#2962FF]" />
              <h1 className="text-2xl font-bold text-[#131722] dark:text-white tracking-tight">
                Offline Dictionaries
              </h1>
            </div>
            <p className="text-xs text-[#787B86] mt-1">
              Manage offline dictionaries for English, Japanese, Chinese, and Korean, or add your own custom words.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowImportModal(!showImportModal)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F3FA] dark:bg-[#2A2E39] hover:bg-[#E0E3EB] dark:hover:bg-[#363A45] text-[#131722] dark:text-white border border-[#E0E3EB] dark:border-[#2A2E39] text-xs font-semibold rounded-md transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{showImportModal ? 'Hide Entry Form' : 'Add Custom Word'}</span>
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="bg-[#2962FF] text-white text-xs px-4 py-2 rounded-md shadow-md flex items-center justify-between animate-fadeIn">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)}>✕</button>
          </div>
        )}

        {/* Storage Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-4 shadow-sm">
            <span className="text-[11px] text-[#787B86] font-mono uppercase">Installed Packages</span>
            <div className="text-2xl font-extrabold text-[#131722] dark:text-white mt-1 tabular-nums">
              {installedCount} <span className="text-xs font-normal text-[#787B86]">/ {packages.length}</span>
            </div>
          </div>
          <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-4 shadow-sm">
            <span className="text-[11px] text-[#787B86] font-mono uppercase">Total Offline Words</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {totalEntries.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-4 shadow-sm">
            <span className="text-[11px] text-[#787B86] font-mono uppercase">Status</span>
            <div className="text-sm font-semibold text-[#131722] dark:text-[#D1D4DC] mt-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ready Offline</span>
            </div>
          </div>
        </div>

        {/* Custom Word Quick Importer */}
        {showImportModal && (
          <form onSubmit={handleAddCustomWord} className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#2962FF] rounded-lg p-5 flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
              <span className="text-xs font-bold text-[#131722] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-[#2962FF]" />
                Add Word to Offline Dictionary
              </span>
              <span className="text-[11px] text-[#787B86] font-mono">
                Stored locally
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#787B86] font-mono mb-1">Word (English)</label>
                <input
                  type="text"
                  value={customWord}
                  onChange={e => setCustomWord(e.target.value)}
                  placeholder="e.g., algorithmic, quant"
                  className="w-full bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] rounded px-3 py-1.5 text-xs text-[#131722] dark:text-white focus:outline-none focus:border-[#2962FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#787B86] font-mono mb-1">Part of Speech</label>
                <select
                  value={customPos}
                  onChange={e => setCustomPos(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] rounded px-3 py-1.5 text-xs text-[#131722] dark:text-white focus:outline-none focus:border-[#2962FF]"
                >
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="financial">Financial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#787B86] font-mono mb-1">Definition</label>
              <input
                type="text"
                value={customDef}
                onChange={e => setCustomDef(e.target.value)}
                placeholder="Enter complete definition..."
                className="w-full bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] rounded px-3 py-1.5 text-xs text-[#131722] dark:text-white focus:outline-none focus:border-[#2962FF]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 text-xs text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded transition-colors"
              >
                Save Word
              </button>
            </div>
          </form>
        )}

        {/* Dictionary Packages Grid */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2962FF]" />
              <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-[#131722] dark:text-white">
                Available Dictionaries ({packages.length})
              </h2>
            </div>
            <span className="text-xs text-[#787B86]">
              Offline definitions, pronunciations, and examples
            </span>
          </div>

          {/* Packages Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => {
              const isDownloading = downloadingId === pkg.id;

              return (
                <div 
                  key={pkg.id} 
                  className={`bg-[#F8F9FD] dark:bg-[#1E222D] border rounded-lg p-5 flex flex-col justify-between transition-all shadow-sm ${
                    pkg.installed ? 'border-[#E0E3EB] dark:border-[#2A2E39]' : 'border-[#E0E3EB] dark:border-[#2A2E39]/60 hover:border-[#2962FF]/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#131722] dark:text-white">
                            {pkg.name}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                            {pkg.language === 'en' ? 'English' : pkg.language === 'ja' ? 'Japanese' : pkg.language === 'zh' ? 'Chinese (Simp)' : pkg.language === 'ko' ? 'Korean' : pkg.language.toUpperCase()} Dictionary
                          </span>
                        </div>
                        <p className="text-xs text-[#787B86] mt-1.5 leading-relaxed">
                          {pkg.description}
                        </p>
                      </div>

                      {pkg.installed ? (
                        <span className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          <span>Installed</span>
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] font-mono text-[#787B86] bg-[#FFFFFF] dark:bg-[#131722] px-2 py-0.5 rounded border border-[#E0E3EB] dark:border-[#2A2E39]">
                          Available
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#E0E3EB] dark:border-[#2A2E39] text-xs font-mono text-[#787B86]">
                      <span>Words: <strong className="text-[#131722] dark:text-[#D1D4DC]">{pkg.entryCount.toLocaleString()}</strong></span>
                      <span>·</span>
                      <span>Size: <strong className="text-[#131722] dark:text-[#D1D4DC]">{pkg.sizeFormatted}</strong></span>
                      <span>·</span>
                      <span>v{pkg.version}</span>
                    </div>
                  </div>

                  {/* Actions & Download Progress */}
                  <div className="mt-4 pt-3 border-t border-[#E0E3EB] dark:border-[#2A2E39]">
                    {isDownloading ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[11px] font-mono text-[#787B86]">
                          <span>Downloading & Indexing...</span>
                          <span>{downloadProgress}%</span>
                        </div>
                        <div className="w-full bg-[#FFFFFF] dark:bg-[#131722] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#2962FF] h-full transition-all duration-200"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : pkg.installed ? (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-[#787B86]">
                          {pkg.isDefault ? 'Default dictionary' : 'Ready for offline lookup'}
                        </span>
                        {!pkg.isDefault && (
                          <button
                            onClick={() => handleUninstall(pkg)}
                            className="flex items-center gap-1.5 text-xs text-[#EF5350] hover:text-red-600 p-1 transition-colors"
                            title="Remove package"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownload(pkg)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded-md transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download & Install ({pkg.sizeFormatted})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personal Custom Entries */}
        {customEntriesList.length > 0 && (
          <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#131722] dark:text-white font-semibold mb-3 flex items-center justify-between">
              <span>Your Custom Words ({customEntriesList.length})</span>
              <span className="text-[#787B86] text-[11px]">Saved in browser</span>
            </h3>

            <div className="divide-y divide-[#E0E3EB] dark:divide-[#2A2E39]">
              {customEntriesList.map(entry => (
                <div key={entry.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#131722] dark:text-white mr-2">{entry.word}</span>
                    <span className="text-[#787B86] font-mono mr-2">({entry.meanings[0]?.partOfSpeech})</span>
                    <span className="text-[#131722] dark:text-[#D1D4DC]">{entry.meanings[0]?.definitions[0]}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveCustomEntry(entry.id)}
                    className="text-[#787B86] hover:text-[#EF5350] p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
