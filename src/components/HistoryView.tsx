/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  History, 
  Trash2, 
  BookOpen, 
  ArrowRight, 
  Clock
} from 'lucide-react';
import { HistoryItem } from '../types/dictionary';

interface HistoryViewProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: HistoryItem) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onSelectHistoryItem,
}) => {

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-150">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-[#2962FF]" />
            <h1 className="text-2xl font-bold text-[#131722] dark:text-white tracking-tight">
              Search History
            </h1>
            <span className="text-xs font-mono text-[#787B86] bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded border border-[#E0E3EB] dark:border-[#2A2E39]">
              {history.length} searches
            </span>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F3FA] dark:bg-[#1E222D] hover:bg-[#EF5350]/20 text-[#EF5350] text-xs font-semibold rounded border border-[#E0E3EB] dark:border-[#2A2E39] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* History Events List */}
        {history.length > 0 ? (
          <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg divide-y divide-[#E0E3EB] dark:divide-[#2A2E39]">
            {history.map(item => (
              <div 
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                className="p-4 flex items-center justify-between hover:bg-[#E0E3EB]/50 dark:hover:bg-[#2A2E39]/40 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-[#2962FF]/10 text-[#2962FF]">
                    <BookOpen className="w-4 h-4" />
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-[#131722] dark:text-white group-hover:text-[#2962FF] transition-colors">
                      {item.query}
                    </span>
                    {item.details && (
                      <span className="text-xs text-[#787B86] font-mono ml-2">
                        ({item.details})
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#787B86] font-mono">
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#787B86] group-hover:text-[#131722] dark:group-hover:text-[#D1D4DC]">
                  <span>Re-open</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#2962FF]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-10 text-center flex flex-col items-center justify-center gap-3">
            <Clock className="w-8 h-8 text-[#787B86]" />
            <h3 className="text-base font-semibold text-[#131722] dark:text-white">
              No search history recorded
            </h3>
            <p className="text-xs text-[#787B86] max-w-sm">
              Your lookups and translations will appear here chronologically for quick recall.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
