import { useState, useEffect, useRef } from "react";

type PropsType = {
  id: string;
  onChange?: (date: Date | null) => void;
  selected?: Date | string;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
  placeholderText?: string;
};

export default function CalendarDatePickerDate({
  id,
  onChange,
  label,
  selected,
  minDate,
  maxDate,
  className = "",
  required = false,
  placeholder,
  placeholderText
}: PropsType) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    selected ? (typeof selected === 'string' ? new Date(selected) : selected) : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? selectedDate.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()
  );

  const calendarRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const newSelectedDate = selected ? (typeof selected === 'string' ? new Date(selected) : selected) : null;
    setSelectedDate(newSelectedDate);
    if (newSelectedDate) {
      setCurrentMonth(newSelectedDate.getMonth());
      setCurrentYear(newSelectedDate.getFullYear());
    }
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDateValid = (date: Date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    if (isDateValid(newDate)) {
      setSelectedDate(newDate);
      setIsOpen(false);
      if (onChange) {
        onChange(newDate);
      }
    }
  };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(month);
  };

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const getYearOptions = () => {
    const startYear = 2020;
    const endYear = 2030;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const isDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return !isDateValid(date);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const today = isToday(day);
      const selected = isSelected(day);
      const disabled = isDisabled(day);

      days.push(
        <button
          key={day}
          onClick={() => !disabled && handleDateSelect(day)}
          disabled={disabled}
          className={`
            h-8 rounded-md text-sm font-medium transition-colors
            ${selected
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : today
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
              : "text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            }
            ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const yearOptions = getYearOptions();

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      <fieldset className="relative border border-gray-300 dark:border-gray-600 rounded-md">
        {label && (
          <legend className="ml-2 px-1 text-xs text-gray-600 dark:text-gray-400">
            {label}
            {required && <span className="text-red-700 ml-1">*</span>}
          </legend>
        )}
        
        <div className="relative px-1">
          <input
            id={id}
            type="text"
            value={formatDate(selectedDate)}
            placeholder={placeholder || placeholderText || "dd-mm-yyyy"}
            onClick={() => setIsOpen(!isOpen)}
            readOnly
            required={required}
            className="w-full bg-transparent border-0 outline-none focus:outline-none text-sm text-gray-900 dark:text-gray-200 cursor-pointer p-1"
          />
          <span className="absolute right-4 top-3 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </span>
        </div>
      </fieldset>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 p-4 w-80">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-2 flex-1 justify-center">
              <select
                value={currentMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-gray-200 outline-none focus:border-blue-500"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-gray-200 outline-none focus:border-blue-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          {/* Today Button */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const today = new Date();
                if (isDateValid(today)) {
                  setSelectedDate(today);
                  setCurrentMonth(today.getMonth());
                  setCurrentYear(today.getFullYear());
                  setIsOpen(false);
                  if (onChange) {
                    onChange(today);
                  }
                }
              }}
              className="px-3 py-1 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => {
                setSelectedDate(null);
                setIsOpen(false);
                if (onChange) {
                  onChange(null);
                }
              }}
              className="px-3 py-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}