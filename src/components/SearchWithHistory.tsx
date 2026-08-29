import React, { useState, useRef, useEffect } from 'react';
import { Search, X, History, Trash2, ArrowUpRight } from 'lucide-react';
import { useSearchHistory } from '../hooks/useSearchHistory';

interface SearchWithHistoryProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  storageKey?: string;
}

export const SearchWithHistory: React.FC<SearchWithHistoryProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search items, categories, keywords...',
  className = '',
  storageKey = 'ht_search_history',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory(storageKey);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectHistory = (item: string) => {
    onChange(item);
    addSearch(item);
    if (onSearch) onSearch(item);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value.trim()) {
        addSearch(value);
      }
      if (onSearch) onSearch(value);
      setIsOpen(false);
    }
  };

  const handleClearInput = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const filteredHistory = value.trim()
    ? history.filter((item) => item.toLowerCase().includes(value.toLowerCase().trim()))
    : history;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Container */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition placeholder:text-slate-400 font-medium shadow-2xs"
        />
        {value && (
          <button
            type="button"
            onClick={handleClearInput}
            className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition active:scale-90"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Interactive Recent Search History Popover Dropdown */}
      {isOpen && history.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <History className="w-3.5 h-3.5 text-brand-600" />
              <span>Recent Searches</span>
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>

          {/* History List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100/70 py-1">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-2 hover:bg-slate-50/90 transition group cursor-pointer"
                >
                  <div
                    onClick={() => handleSelectHistory(item)}
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 shrink-0 transition-colors" />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-600 truncate">
                      {item}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(item);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Remove from history"
                      aria-label="Remove search history item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-center text-xs text-slate-400">
                No matching recent searches
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
