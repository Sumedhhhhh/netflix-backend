import { useState } from 'react';
import { Settings } from 'lucide-react';
import type { HlsLevel } from '../../hooks/useHlsPlayer';

interface QualitySelectorProps {
  levels: HlsLevel[];
  currentLevel: number; // -1 = Auto
  onSetLevel: (level: number) => void;
}

export function QualitySelector({
  levels,
  currentLevel,
  onSetLevel,
}: QualitySelectorProps) {
  const [open, setOpen] = useState(false);

  const currentLabel =
    currentLevel === -1
      ? 'Auto'
      : levels[currentLevel]?.name ?? `Level ${currentLevel}`;

  const handleSelect = (level: number) => {
    onSetLevel(level);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex items-center gap-1.5
          text-white text-xs hover:text-netflix-gray-light
          transition-colors p-1
        "
        aria-label="Quality settings"
        aria-expanded={open}
      >
        <Settings size={18} />
        <span className="hidden md:inline">{currentLabel}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div
            className="
              absolute bottom-full right-0 mb-2
              min-w-[120px]
              bg-netflix-bg-secondary border border-netflix-gray-dark/50
              rounded shadow-2xl z-50
              animate-fadeIn
            "
          >
            <div className="py-1">
              {/* Auto option */}
              <button
                onClick={() => handleSelect(-1)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  hover:bg-netflix-bg-elevated transition-colors
                  ${currentLevel === -1 ? 'text-white font-semibold' : 'text-netflix-gray-light'}
                `}
              >
                Auto
                {currentLevel === -1 && (
                  <span className="ml-2 text-netflix-red text-xs">✓</span>
                )}
              </button>

              {/* Level options */}
              {levels.map((level, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`
                    w-full px-4 py-2 text-left text-sm
                    hover:bg-netflix-bg-elevated transition-colors
                    ${currentLevel === idx ? 'text-white font-semibold' : 'text-netflix-gray-light'}
                  `}
                >
                  {level.name}
                  {currentLevel === idx && (
                    <span className="ml-2 text-netflix-red text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
