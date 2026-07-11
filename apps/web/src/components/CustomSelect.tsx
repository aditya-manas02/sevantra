import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface Option {
  value: string | number;
  label: string | React.ReactNode;
  className?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  wrapperClassName?: string;
}

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...', className = '', menuClassName = '', wrapperClassName = 'w-full' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className={`relative ${wrapperClassName}`} ref={containerRef}>
      {/* Select trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-base text-[var(--text-primary)] shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all ${className}`}
      >
        <span className={`truncate ${!selectedOption ? 'opacity-70' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 ml-1 flex-shrink-0 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 ${menuClassName}`}>
          <div className="max-h-60 overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors flex items-center ${
                  String(value) === String(option.value)
                    ? 'bg-[var(--primary)] text-white font-bold'
                    : 'text-[var(--text-primary)] hover:bg-[var(--background)]'
                } ${option.className || ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
