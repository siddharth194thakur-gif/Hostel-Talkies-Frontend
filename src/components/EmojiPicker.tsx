import React, { useState, useMemo } from 'react';
import { Search, X, Smile } from 'lucide-react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥹', '😊',
      '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙',
      '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎',
      '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁',
      '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😮‍💨', '😤',
      '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰',
      '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🫢', '🫡', '🤫', '🫠',
      '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷'
    ]
  },
  {
    id: 'gestures',
    name: 'People & Gestures',
    icon: '👋',
    emojis: [
      '👍', '👎', '👌', '🤌', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
      '🖖', '🫱', '🫲', '🤝', '👏', '🙌', '🫶', '👐', '🤲', '🙏',
      '💪', '🦾', '✍️', '💅', '🤳', '🙋‍♂️', '🙋‍♀️', '🤷‍♂️', '🤷‍♀️', '🤦‍♂️',
      '🤦‍♀️', '🙇‍♂️', '🙇‍♀️', '🧑‍💻', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👑', '💯'
    ]
  },
  {
    id: 'hearts',
    name: 'Hearts & Love',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
      '✨', '⭐', '🌟', '💫', '🔥', '💥', '🎉', '🎊', '🎈', '🎁'
    ]
  },
  {
    id: 'campus',
    name: 'Campus & Study',
    icon: '🎓',
    emojis: [
      '🎓', '📚', '📖', '📝', '✏️', '💻', '🖥️', '📱', '🔋', '💡',
      '📐', '📏', '📎', '📌', '📅', '📆', '⏰', '⏱️', '🎒', '🚀',
      '☕', '🍵', '🧋', '🍕', '🍔', '🍟', '🍜', '🍲', '🍿', '🍫',
      '🍩', '🍪', '🥤', '🥪', '🍱', '🍛', '🍳', '🍎', '🍉', '🍌'
    ]
  },
  {
    id: 'activities',
    name: 'Sports & Games',
    icon: '🏸',
    emojis: [
      '🏸', '🏏', '⚽', '🏀', '🎾', '🏐', '🏉', '🏓', '🎱', '🎳',
      '🎮', '🕹️', '🎧', '🎸', '🎹', '🥁', '🎤', '🎬', '🏆', '🥇',
      '🥈', '🥉', '🎯', '🎲', '♟️', '🚴‍♂️', '🏋️‍♂️', '🧘‍♂️', '🏊‍♂️'
    ]
  },
  {
    id: 'symbols',
    name: 'Symbols & Travel',
    icon: '⚡',
    emojis: [
      '⚡', '☀️', '🌙', '⭐', '🌧️', '⚡', '🌈', '🚲', '🛵', '🚗',
      '✈️', '🚊', '🔔', '🔒', '🔑', '💬', '💭', '🗯️', '✔️', '❌',
      '❓', '❗', '⚠️', '⛔', '🟢', '🔴', '🟣', '🔵', '🟠', '🟡'
    ]
  }
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [search, setSearch] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return null;
    const all = EMOJI_CATEGORIES.flatMap(c => c.emojis);
    return all;
  }, [search]);

  return (
    <div
      className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-80 max-w-[calc(100vw-2rem)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Header */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/80">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-50 outline-none placeholder:text-slate-400"
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition"
          aria-label="Close emoji picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex items-center justify-around border-b border-slate-100 bg-slate-50/50 p-1 text-base">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-1.5 rounded-xl transition text-sm ${
                activeCategory === cat.id ? 'bg-white shadow-xs scale-110' : 'opacity-60 hover:opacity-100 hover:bg-slate-100'
              }`}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-3 h-60 overflow-y-auto grid grid-cols-7 gap-1.5 text-xl">
        {search ? (
          filteredEmojis && filteredEmojis.length > 0 ? (
            filteredEmojis.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectEmoji(emoji);
                }}
                className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-xl active:scale-125 transition duration-100"
              >
                {emoji}
              </button>
            ))
          ) : (
            <div className="col-span-7 py-10 text-center text-xs text-slate-400">
              No emojis found
            </div>
          )
        ) : (
          EMOJI_CATEGORIES.find(c => c.id === activeCategory)?.emojis.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                onSelectEmoji(emoji);
              }}
              className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-xl active:scale-125 transition duration-100"
            >
              {emoji}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

