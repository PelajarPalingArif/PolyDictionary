/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Volume2, 
  Keyboard, 
  RotateCcw,
  Languages,
  Sparkles,
  Cpu,
  CheckCircle,
  AlertCircle,
  Play,
  Square,
  Loader2,
  Download
} from 'lucide-react';
import { LanguageCode } from '../types/dictionary';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { 
  speechService, 
  TTSEngineType, 
  KokoroVoiceId, 
  KOKORO_VOICES, 
  KokoroStatus 
} from '../services/speechService';

interface SettingsModalProps {
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  accent: 'US' | 'UK';
  onAccentChange: (accent: 'US' | 'UK') => void;
  defaultLanguage: LanguageCode;
  onDefaultLanguageChange: (lang: LanguageCode) => void;
  onResetAllData: () => void;
  ttsEngine?: TTSEngineType;
  onTtsEngineChange?: (engine: TTSEngineType) => void;
  kokoroVoice?: KokoroVoiceId;
  onKokoroVoiceChange?: (voice: KokoroVoiceId) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  speechRate,
  onSpeechRateChange,
  accent,
  onAccentChange,
  defaultLanguage,
  onDefaultLanguageChange,
  onResetAllData,
  ttsEngine = 'kokoro',
  onTtsEngineChange,
  kokoroVoice = 'af_heart',
  onKokoroVoiceChange,
}) => {
  const [kokoroStatus, setKokoroStatus] = useState<KokoroStatus>(() => speechService.getKokoroStatus());
  const [isPlayingSample, setIsPlayingSample] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    const unsubscribe = speechService.subscribeStatus((status) => {
      setKokoroStatus(status);
      if (status.state === 'ready') {
        setIsPreloading(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleEngineSelect = (engine: TTSEngineType) => {
    speechService.setEngine(engine);
    onTtsEngineChange?.(engine);
  };

  const handleVoiceSelect = (voiceId: KokoroVoiceId) => {
    speechService.setKokoroVoice(voiceId);
    onKokoroVoiceChange?.(voiceId);
  };

  const handlePreload = async () => {
    setIsPreloading(true);
    await speechService.preloadKokoro();
    setIsPreloading(false);
  };

  const handleTestSpeech = async () => {
    if (isPlayingSample) {
      speechService.stop();
      setIsPlayingSample(false);
      return;
    }

    setIsPlayingSample(true);
    const sampleText = accent === 'UK'
      ? 'Language is the roadmap of a culture. It tells you where its people come from and where they are going.'
      : 'The beauty of language lies in its subtleties, shaping how we think, connect, and explore.';

    await speechService.speak(sampleText, 'en', accent, speechRate);
    setIsPlayingSample(false);
  };

  // Filter voices according to active accent
  const filteredVoices = KOKORO_VOICES.filter(v => v.accent === accent);

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

        {/* Text-to-Speech Engine Section */}
        <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-5 flex flex-col gap-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-semibold text-[#131722] dark:text-white">Text-to-Speech Engine</h2>
            </div>
            <span className="text-[11px] font-mono text-[#787B86]">Audio Generation</span>
          </div>

          {/* Engine Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kokoro Neural Engine */}
            <button
              type="button"
              onClick={() => handleEngineSelect('kokoro')}
              className={`p-4 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-3 ${
                ttsEngine === 'kokoro'
                  ? 'border-purple-500/80 bg-purple-500/5 shadow-sm ring-1 ring-purple-500/30'
                  : 'border-[#E0E3EB] dark:border-[#2A2E39] bg-[#FFFFFF] dark:bg-[#131722] hover:border-purple-400/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-xs text-[#131722] dark:text-white">Kokoro Neural AI</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-[#787B86] leading-relaxed">
                  82M parameter StyleTTS2 model running client-side via WebGPU/WASM. Studio-grade naturalness and human cadence.
                </p>
              </div>

              <div className="pt-2 border-t border-purple-500/10 flex items-center justify-between text-[10px] font-mono text-[#787B86]">
                <span>Quality: <strong className="text-purple-600 dark:text-purple-400">Studio (A+)</strong></span>
                <span>Size: ~86MB (Cached)</span>
              </div>
            </button>

            {/* Native Browser Speech */}
            <button
              type="button"
              onClick={() => handleEngineSelect('native')}
              className={`p-4 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-3 ${
                ttsEngine === 'native'
                  ? 'border-[#2962FF] bg-[#2962FF]/5 shadow-sm ring-1 ring-[#2962FF]/30'
                  : 'border-[#E0E3EB] dark:border-[#2A2E39] bg-[#FFFFFF] dark:bg-[#131722] hover:border-[#2962FF]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#2962FF]" />
                    <span className="font-semibold text-xs text-[#131722] dark:text-white">Native Browser Speech</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2962FF]/10 text-[#2962FF] dark:text-blue-300 font-mono">
                    Built-in
                  </span>
                </div>
                <p className="text-[11px] text-[#787B86] leading-relaxed">
                  Standard browser Web Speech API. Instant startup with zero model download, but uses synthetic system voices.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-between text-[10px] font-mono text-[#787B86]">
                <span>Quality: Standard</span>
                <span>Size: 0 MB</span>
              </div>
            </button>
          </div>

          {/* Kokoro Model Status & Controls (when Kokoro active) */}
          {ttsEngine === 'kokoro' && (
            <div className="bg-[#FFFFFF] dark:bg-[#131722] border border-purple-500/20 rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {kokoroStatus.state === 'loading' || isPreloading ? (
                    <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                  ) : kokoroStatus.state === 'ready' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : kokoroStatus.state === 'error' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  )}
                  <div>
                    <span className="text-xs font-semibold text-[#131722] dark:text-white block">
                      {kokoroStatus.state === 'ready'
                        ? 'Kokoro 82M Model Ready'
                        : kokoroStatus.state === 'loading' || isPreloading
                        ? 'Downloading Neural Weights (~86MB)...'
                        : kokoroStatus.state === 'error'
                        ? 'Model Initialization Notice'
                        : 'Neural Model On-Demand'}
                    </span>
                    <span className="text-[11px] text-[#787B86]">
                      {kokoroStatus.statusText}
                    </span>
                  </div>
                </div>

                {kokoroStatus.state !== 'ready' && !isPreloading && (
                  <button
                    onClick={handlePreload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download & Pre-warm (86MB)</span>
                  </button>
                )}
              </div>

              {/* Progress bar during download */}
              {(kokoroStatus.state === 'loading' || isPreloading) && (
                <div className="w-full bg-[#E0E3EB] dark:bg-[#2A2E39] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(kokoroStatus.progress, 10)}%` }}
                  />
                </div>
              )}

              {/* Voice Selection */}
              <div className="pt-2 border-t border-[#E0E3EB] dark:border-[#2A2E39] flex flex-col gap-2">
                <label className="text-[11px] font-mono text-[#787B86]">
                  Select Neural Voice ({accent} English):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredVoices.map((voice) => (
                    <button
                      key={voice.id}
                      type="button"
                      onClick={() => handleVoiceSelect(voice.id)}
                      className={`p-2.5 rounded border text-left flex items-center justify-between transition-colors ${
                        kokoroVoice === voice.id
                          ? 'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold ring-1 ring-purple-500/30'
                          : 'border-[#E0E3EB] dark:border-[#2A2E39] bg-[#FFFFFF] dark:bg-[#131722] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#131722] dark:text-white font-medium">{voice.name}</span>
                          <span className="text-[10px] text-[#787B86] font-mono">({voice.gender})</span>
                          {voice.recommended && (
                            <span className="text-[9px] px-1 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-mono">
                              Top Pick
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#787B86] mt-0.5">{voice.description}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-[#787B86]">{voice.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Test Pronunciation Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#787B86]">
              Preview current engine with sample sentence:
            </span>
            <button
              onClick={handleTestSpeech}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all ${
                isPlayingSample
                  ? 'bg-purple-600 text-white animate-pulse'
                  : 'bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#131722] dark:text-white hover:border-[#2962FF]'
              }`}
            >
              {isPlayingSample ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Preview</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#2962FF] text-[#2962FF]" />
                  <span>Listen to Sample Voice</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audio Speech Controls (Rate & Accent) */}
        <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <Volume2 className="w-4 h-4 text-[#2962FF]" />
            <h2 className="text-sm font-semibold text-[#131722] dark:text-white">Pronunciation Settings</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#787B86] font-mono mb-1.5">
                Speaking Rate: <span className="text-[#131722] dark:text-white font-bold">{speechRate}x</span>
              </label>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={speechRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value);
                  onSpeechRateChange(rate);
                }}
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
                  type="button"
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
                  type="button"
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

          <p className="text-[11px] text-[#787B86] leading-relaxed pt-1">
            <strong className="text-[#131722] dark:text-[#D1D4DC]">Multilingual Notice:</strong> Kokoro Neural TTS synthesizes English entries with studio realism. For Japanese, Chinese, Korean, Spanish, French, and other languages, PolyDictionary automatically and seamlessly routes pronunciation to native browser voices.
          </p>
        </div>

        {/* Default Language Setting */}
        <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
            <Languages className="w-4 h-4 text-[#2962FF]" />
            <h2 className="text-sm font-semibold text-[#131722] dark:text-white">Default Lookup Language</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {SUPPORTED_LANGUAGES.slice(0, 8).map((lang) => (
              <button
                key={lang.code}
                type="button"
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
