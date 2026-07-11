import React, { useEffect, useState } from 'react';
import CustomSelect from './CustomSelect';

interface DateTimePickerProps {
  value: Date | null | undefined;
  onChange: (date: Date) => void;
  label: string;
  error?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HOURS = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
const MINUTES = ['00', '15', '30', '45'];

export default function DateTimePicker({ value, onChange, label, error }: DateTimePickerProps) {
  const current = value ? new Date(value) : new Date();
  
  const [month, setMonth] = useState(current.getMonth());
  const [date, setDate] = useState(current.getDate());
  const [year, setYear] = useState(current.getFullYear());
  
  let initialHour = current.getHours();
  const [ampm, setAmpm] = useState(initialHour >= 12 ? 'PM' : 'AM');
  const [hour, setHour] = useState(initialHour % 12 || 12);
  
  const minuteValue = current.getMinutes();
  const closestMin = MINUTES.reduce((prev, curr) => 
    Math.abs(parseInt(curr) - minuteValue) < Math.abs(parseInt(prev) - minuteValue) ? curr : prev
  );
  const [minute, setMinute] = useState(closestMin);

  // When any value changes, compute the new date and bubble up
  useEffect(() => {
    let finalHour = hour;
    if (ampm === 'PM' && hour !== 12) finalHour += 12;
    if (ampm === 'AM' && hour === 12) finalHour = 0;
    
    const newDate = new Date(year, month, date, finalHour, parseInt(minute));
    // Check if valid before triggering
    if (!isNaN(newDate.getTime())) {
      onChange(newDate);
    }
  }, [month, date, year, hour, minute, ampm]);

  // Days in selected month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const yearsArray = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  return (
    <div className="flex flex-col mb-4">
      <label className="text-sm font-bold text-[var(--text-primary)] mb-2">{label}</label>
      
      <div className="flex flex-col gap-3">
        {/* Date Container */}
        <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-soft-sm focus-within:ring-2 focus-within:ring-[var(--primary)] transition-shadow">
          <CustomSelect 
            value={month} 
            onChange={(val) => setMonth(Number(val))}
            options={MONTHS.map((m, i) => ({ value: i, label: m }))}
            className="border-none shadow-none bg-transparent rounded-r-none px-3 !h-full font-medium"
            wrapperClassName="flex-1 min-w-0"
            menuClassName="w-32"
          />
          <div className="w-px bg-[var(--border)] shrink-0" />
          <CustomSelect 
            value={date} 
            onChange={(val) => setDate(Number(val))}
            options={daysArray.map(d => ({ value: d, label: String(d) }))}
            className="border-none shadow-none bg-transparent rounded-none px-2 !h-full font-medium"
            wrapperClassName="flex-1 min-w-0"
            menuClassName="w-20"
          />
          <div className="w-px bg-[var(--border)] shrink-0" />
          <CustomSelect 
            value={year} 
            onChange={(val) => setYear(Number(val))}
            options={yearsArray.map(y => ({ value: y, label: String(y) }))}
            className="border-none shadow-none bg-transparent rounded-l-none px-2 !h-full font-medium"
            wrapperClassName="flex-1 min-w-0"
            menuClassName="w-28"
          />
        </div>

        {/* Time Container */}
        <div className="flex bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-soft-sm focus-within:ring-2 focus-within:ring-[var(--primary)] transition-shadow items-center w-full max-w-[300px]">
          <CustomSelect 
            value={hour} 
            onChange={(val) => setHour(Number(val))}
            options={HOURS.map(h => ({ value: h, label: String(h) }))}
            className="border-none shadow-none bg-transparent rounded-r-none px-2 !h-full font-medium justify-center"
            wrapperClassName="flex-1 min-w-0"
            menuClassName="w-20"
          />
          <span className="text-[var(--text-secondary)] font-bold shrink-0 opacity-50">:</span>
          <CustomSelect 
            value={minute} 
            onChange={(val) => setMinute(String(val))}
            options={MINUTES.map(m => ({ value: m, label: m }))}
            className="border-none shadow-none bg-transparent rounded-none px-2 !h-full font-medium justify-center"
            wrapperClassName="flex-1 min-w-0"
            menuClassName="w-20"
          />
          <div className="w-px bg-[var(--border)] h-full shrink-0" />
          <CustomSelect 
            value={ampm} 
            onChange={(val) => setAmpm(String(val))}
            options={[{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]}
            className="border-none shadow-none !bg-[var(--primary)] !text-white hover:!bg-green-700 font-bold rounded-l-none px-2 !h-full justify-center"
            wrapperClassName="flex-1 min-w-0"
            menuClassName="w-24"
          />
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
