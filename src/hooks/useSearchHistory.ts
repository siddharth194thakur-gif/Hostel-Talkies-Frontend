import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ht_search_history';
const MAX_HISTORY = 8;

export const useSearchHistory = (customKey: string = STORAGE_KEY) => {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(customKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(customKey, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  }, [history, customKey]);

  const addSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, MAX_HISTORY);
    });
  };

  const removeSearch = (query: string) => {
    setHistory((prev) => prev.filter((item) => item.toLowerCase() !== query.toLowerCase()));
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(customKey);
    } catch {}
  };

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
  };
};
