/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Volume2, 
  Search, 
  Download, 
  ArrowRight
} from 'lucide-react';
import { BookmarkItem } from '../types/dictionary';
import { speechService } from '../services/speechService';

interface BookmarksViewProps {
  bookmarks: BookmarkItem[];
  onRemoveBookmark: (id: string) => void;
  onLookupWord: (word: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onRemoveBookmark,
  onLookupWord,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags || [])));

  const filtered = bookmarks.filter(b => {
    const matchesSearch = b.word.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.shortDefinition.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || b.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `polydictionary_bookmarks_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const header = "Word,Language,PartOfSpeech,Definition,SavedDate\n";
    const rows = bookmarks.map(b => 
      `"${b.word}","${b.language}","${b.primaryPartOfSpeech}","${b.shortDefinition.replace(/"/g, '""')}","${new Date(b.savedAt).toISOString()}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `polydictionary_bookmarks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] dark:bg-[#131722] text-[#131722] dark:text-[#D1D4DC] overflow-y-auto p-4 sm:p-6 lg:p-8 transition-colors duration-150">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0E3EB] dark:border-[#2A2E39]">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-[#2962FF]" />
            <h1 className="text-2xl font-bold text-[#131722] dark:text-white tracking-tight">
              Bookmarked Vocabulary
            </h1>
            <span className="text-xs font-mono text-[#787B86] bg-[#F0F3FA] dark:bg-[#1E222D] px-2 py-0.5 rounded border border-[#E0E3EB] dark:border-[#2A2E39]">
              {bookmarks.length} {bookmarks.length === 1 ? 'word' : 'words'}
            </span>
          </div>

          {bookmarks.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F3FA] dark:bg-[#1E222D] hover:bg-[#E0E3EB] dark:hover:bg-[#2A2E39] text-[#131722] dark:text-[#D1D4DC] text-xs font-medium rounded border border-[#E0E3EB] dark:border-[#2A2E39] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2962FF] hover:bg-[#1E53E5] text-white text-xs font-semibold rounded transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter & Tag Bar */}
        {bookmarks.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#787B86] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Filter saved words or definitions..."
                className="w-full bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded pl-9 pr-4 py-2 text-xs text-[#131722] dark:text-white placeholder-[#787B86] focus:outline-none focus:border-[#2962FF]"
              />
            </div>

            {allTags.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-3 py-1.5 rounded transition-colors text-xs font-mono ${
                    selectedTag === 'all'
                      ? 'bg-[#2962FF] text-white'
                      : 'bg-[#F0F3FA] dark:bg-[#1E222D] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC]'
                  }`}
                >
                  All Tags
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded transition-colors text-xs font-mono ${
                      selectedTag === tag
                        ? 'bg-[#2962FF] text-white'
                        : 'bg-[#F0F3FA] dark:bg-[#1E222D] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC]'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks List */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(item => (
              <div 
                key={item.id}
                className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] hover:border-[#2962FF]/50 rounded-lg p-5 flex flex-col justify-between transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#131722] dark:text-white tracking-tight">
                        {item.word}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        {item.phonetic && (
                          <span className="text-[#2962FF] font-mono">
                            {item.phonetic}
                          </span>
                        )}
                        <span className="text-[#787B86]">·</span>
                        <span className="text-[#787B86] font-mono uppercase">
                          {item.primaryPartOfSpeech}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => speechService.speak(item.word, item.language)}
                        className="p-1.5 rounded hover:bg-[#FFFFFF] dark:hover:bg-[#131722] text-[#787B86] hover:text-[#131722] dark:hover:text-[#D1D4DC] transition-colors"
                        title="Pronounce word"
                      >
                        <Volume2 className="w-4 h-4 text-[#2962FF]" />
                      </button>
                      <button
                        onClick={() => onRemoveBookmark(item.id)}
                        className="p-1.5 rounded hover:bg-[#FFFFFF] dark:hover:bg-[#131722] text-[#787B86] hover:text-[#EF5350] transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#131722] dark:text-[#D1D4DC] mt-3 leading-relaxed">
                    {item.shortDefinition}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E0E3EB] dark:border-[#2A2E39] flex items-center justify-between text-[11px] font-mono text-[#787B86]">
                  <span>Saved: {new Date(item.savedAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => onLookupWord(item.word)}
                    className="flex items-center gap-1 text-[#2962FF] hover:text-[#1E53E5] font-semibold transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F8F9FD] dark:bg-[#1E222D] border border-[#E0E3EB] dark:border-[#2A2E39] rounded-lg p-10 text-center flex flex-col items-center justify-center gap-3">
            <Bookmark className="w-8 h-8 text-[#787B86]" />
            <h3 className="text-base font-semibold text-[#131722] dark:text-white">
              {bookmarks.length === 0 ? 'No bookmarks saved yet' : 'No matching bookmarks'}
            </h3>
            <p className="text-xs text-[#787B86] max-w-sm">
              Click the bookmark icon on any word in the dictionary to save it here for offline study and flashcard review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
