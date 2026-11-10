/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  SlidersHorizontal, 
  Volume2, 
  Keyboard, 
  RotateCcw,
  Languages
} from 'lucide-react';
import { LanguageCode } from '../types/dictionary';
import { SUPPORTED_LANGUAGES } from '../data/languages';

interface SettingsModalProps {
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  accent: 'US' | 'UK';
  onAccentChange: (accent: 'US' | 'UK') => void;
  defaultLanguage: LanguageCode;
  onDefaultLanguageChange: (lang: LanguageCode) => void;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  speechRate,
  onSpeechRateChange,
  accent,
  onAccentChange,
  defaultLanguage,
  onDefaultLanguageChange,
  onResetAllData,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-150">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-[#2962FF]" />
            <h1 className="text-2xl font-bold text-[#131722] dark:text-white tracking-tight">
              Settings & Preferences
            </h1>
          </div>
          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Saved Locally
          </span>
        </div>

        {/* Audio Speech Settings */}
        <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <Volume2 className="w-4 h-4 text-[#2962FF]" />
            <h2 className="text-sm font-semibold text-[#131722] dark:text-white">Audio & Pronunciation</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#787B86] font-mono mb-1.5">
                Playback Speed: <span className="text-[#131722] dark:text-white font-bold">{speechRate}x</span>
              </label>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.1"
                value={speechRate}
                onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
                className="w-full accent-[#2962FF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#787B86] font-mono mt-1">
                <span>0.6x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>1.4x (Fast)</span>
              </div>
            </div>

            <div>
              <label className="block text-[#787B86] font-mono mb-1.5">Default English Accent</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onAccentChange('US')}
                  className={`flex-1 py-1.5 rounded text-xs font-mono border transition-colors ${
                    accent === 'US'
                      ? 'bg-[#2962FF] text-white border-[#2962FF]'
                      : 'bg-[#FFFFFF] dark:bg-[#131722] text-[#787B86] border-[#E0E3EB] dark:border-[#2A2E39] hover:text-[#131722] dark:hover:text-[#D1D4DC]'
                  }`}
                >
                  US English (American)
                </button>
                <button
                  onClick={() => onAccentChange('UK')}
                  className={`flex-1 py-1.5 rounded text-xs font-mono border transition-colors ${
                    accent === 'UK'
                      ? 'bg-[#2962FF] text-white border-[#2962FF]'
                      : 'bg-[#FFFFFF] dark:bg-[#131722] text-[#787B86] border-[#E0E3EB] dark:border-[#2A2E39] hover:text-[#131722] dark:hover:text-[#D1D4DC]'
                  }`}
                >
                  UK English (British)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Default Language Setting */}
        <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <Languages className="w-4 h-4 text-[#2962FF]" />
            <h2 className="text-sm font-semibold text-[#131722] dark:text-white">Default Lookup Language</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {SUPPORTED_LANGUAGES.slice(0, 6).map((lang) => (
              <button
                key={lang.code}
                onClick={() => onDefaultLanguageChange(lang.code)}
                className={`p-2.5 rounded border text-left flex items-center justify-between transition-colors ${
                  defaultLanguage === lang.code
                    ? 'bg-[#2962FF]/15 border-[#2962FF] text-[#2962FF] dark:text-white font-semibold'
                    : 'bg-[#FFFFFF] dark:bg-[#131722] border-[#E0E3EB] dark:border-[#2A2E39] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                <span className="text-[10px] font-mono uppercase">{lang.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-5 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <Keyboard className="w-4 h-4 text-[#2962FF]" />
            <h2 className="text-sm font-semibold text-[#131722] dark:text-white">Keyboard Shortcuts</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39]">
              <span className="text-[#787B86]">Quick Search</span>
              <kbd className="bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded text-[#2962FF] border border-[#E0E3EB] dark:border-[#2A2E39]">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39]">
              <span className="text-[#787B86]">Dictionary</span>
              <kbd className="bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded text-[#131722] dark:text-[#D1D4DC] border border-[#E0E3EB] dark:border-[#2A2E39]">Ctrl + 1</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39]">
              <span className="text-[#787B86]">Browse</span>
              <kbd className="bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded text-[#131722] dark:text-[#D1D4DC] border border-[#E0E3EB] dark:border-[#2A2E39]">Ctrl + 2</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39]">
              <span className="text-[#787B86]">Dictionaries</span>
              <kbd className="bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded text-[#131722] dark:text-[#D1D4DC] border border-[#E0E3EB] dark:border-[#2A2E39]">Ctrl + 3</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39]">
              <span className="text-[#787B86]">Word of the Day</span>
              <kbd className="bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded text-[#131722] dark:text-[#D1D4DC] border border-[#E0E3EB] dark:border-[#2A2E39]">Ctrl + 4</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39]">
              <span className="text-[#787B86]">Bookmarks</span>
              <kbd className="bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded text-[#131722] dark:text-[#D1D4DC] border border-[#E0E3EB] dark:border-[#2A2E39]">Ctrl + 5</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39]">
              <span className="text-[#787B86]">History</span>
              <kbd className="bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded text-[#131722] dark:text-[#D1D4DC] border border-[#E0E3EB] dark:border-[#2A2E39]">Ctrl + 6</kbd>
            </div>
          </div>
        </div>

        {/* Reset Storage */}
        <div className="p-4 rounded-lg border border-[#EF5350]/30 bg-[#EF5350]/5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#EF5350]">Reset App Data</h3>
            <p className="text-[11px] text-[#787B86] mt-0.5">
              Clear all bookmarks, search history, and downloaded dictionaries from browser storage.
            </p>
          </div>
          <button
            onClick={onResetAllData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF5350] hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
