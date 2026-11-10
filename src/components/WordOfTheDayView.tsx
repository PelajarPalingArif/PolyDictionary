/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CalendarDays, 
  Volume2, 
  ArrowRight, 
  Quote
} from 'lucide-react';
import { WORD_OF_THE_DAY_ARCHIVE } from '../data/wordOfTheDayData';
import { BookmarkItem, DictionaryEntry } from '../types/dictionary';
import { speechService } from '../services/speechService';

interface WordOfTheDayViewProps {
  bookmarks: BookmarkItem[];
  onToggleBookmark: (entry: DictionaryEntry) => void;
  onLookupWord: (word: string) => void;
}

export const WordOfTheDayView: React.FC<WordOfTheDayViewProps> = ({
  bookmarks,
  onToggleBookmark,
  onLookupWord,
}) => {
  const today = WORD_OF_THE_DAY_ARCHIVE[0];

  const handlePronounce = (text: string) => {
    speechService.speak(text, 'en');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-150">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-[#2962FF]" />
            <h1 className="text-2xl font-bold text-[#131722] dark:text-white tracking-tight">
              Word of the Day
            </h1>
          </div>
          <span className="text-xs font-mono text-[#787B86] bg-[#F0F3FA] dark:bg-[#1E222D] px-2.5 py-1 rounded border border-[#E0E3EB] dark:border-[#2A2E39]">
            Updated Daily
          </span>
        </div>

        {/* Featured Daily Hero Card */}
        <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-xl p-6 sm:p-8 shadow-lg relative overflow-hidden transition-colors duration-150">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {today.date}
                </span>
                <span className="text-xs font-mono text-[#787B86] uppercase bg-[#FFFFFF] dark:bg-[#131722] px-2 py-0.5 rounded border border-[#E0E3EB] dark:border-[#2A2E39]">
                  {today.difficulty} Level
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#131722] dark:text-white tracking-tight">
                {today.word}
              </h2>

              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="text-[#2962FF] font-mono font-medium">
                  {today.phonetic}
                </span>
                <span className="text-[#787B86]">·</span>
                <span className="text-[#787B86] font-mono uppercase text-xs">
                  {today.partOfSpeech}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePronounce(today.word)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FFFFFF] dark:bg-[#131722] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] border border-[#E0E3EB] dark:border-[#2A2E39] text-[#131722] dark:text-[#D1D4DC] text-xs font-semibold transition-colors"
                title="Listen to pronunciation"
              >
                <Volume2 className="w-4 h-4 text-[#2962FF]" />
                <span>Audio</span>
              </button>

              <button
                onClick={() => onLookupWord(today.word)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <span>View in Dictionary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Definition Body */}
          <div className="mt-6 pt-5 border-t border-[#E0E3EB] dark:border-[#2A2E39] flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-mono uppercase text-[#787B86] tracking-wider mb-1 font-semibold">
                Definition
              </h3>
              <p className="text-base text-[#131722] dark:text-[#D1D4DC] leading-relaxed font-medium">
                {today.definition}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase text-[#787B86] tracking-wider mb-1 font-semibold">
                Contextual Example
              </h3>
              <p className="text-sm text-[#6A6D78] dark:text-[#787B86] italic pl-3 border-l-2 border-[#2962FF]">
                "{today.example}"
              </p>
            </div>

            <div>
              <h3 className="text-xs font-mono uppercase text-[#787B86] tracking-wider mb-1 font-semibold">
                Etymology
              </h3>
              <p className="text-xs text-[#131722] dark:text-[#D1D4DC] leading-relaxed">
                {today.etymology}
              </p>
            </div>

            {/* Inspirational Quote Card */}
            {today.quote && (
              <div className="mt-2 bg-[#FFFFFF] dark:bg-[#131722] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-4 flex gap-3 items-start">
                <Quote className="w-5 h-5 text-[#2962FF] shrink-0 mt-0.5 opacity-80" />
                <div>
                  <p className="text-xs text-[#131722] dark:text-[#D1D4DC] italic leading-relaxed">
                    "{today.quote.text}"
                  </p>
                  <span className="block text-[11px] font-mono text-[#787B86] mt-1">
                    — {today.quote.author}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous Days Archive */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#787B86] font-semibold">
            Previous Words
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORD_OF_THE_DAY_ARCHIVE.slice(1).map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] hover:border-[#2962FF]/50 rounded-lg p-5 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-[#787B86]">
                      {item.date}
                    </span>
                    <span className="text-[11px] font-mono text-[#2962FF] bg-[#2962FF]/10 px-2 py-0.5 rounded">
                      {item.difficulty}
                    </span>
                  </div>

                  <h4 className="text-2xl font-bold text-[#131722] dark:text-white tracking-tight">
                    {item.word}
                  </h4>
                  <span className="text-xs font-mono text-[#787B86]">
                    {item.phonetic} · {item.partOfSpeech}
                  </span>

                  <p className="text-xs text-[#131722] dark:text-[#D1D4DC] mt-2 line-clamp-2 leading-relaxed">
                    {item.definition}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-between">
                  <button
                    onClick={() => handlePronounce(item.word)}
                    className="p-1.5 text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC] hover:bg-[#FFFFFF] dark:hover:bg-[#131722] rounded transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onLookupWord(item.word)}
                    className="flex items-center gap-1.5 text-xs text-[#2962FF] hover:text-[#1E53E5] font-semibold transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
