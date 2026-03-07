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
   dateFormat?: string;  
};

export default function CalendarStockReceive({
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
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
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

  const handleMonthChange = (increment: number) => {
    let newMonth = currentMonth + increment;
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

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(month);
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear;
      
      const isToday = new Date().getDate() === day && 
        new Date().getMonth() === currentMonth && 
        new Date().getFullYear() === currentYear;
      
      const isValid = isDateValid(date);
      
      days.push(
        <button
          key={day}
          onClick={() => isValid && handleDateSelect(day)}
          disabled={!isValid}
          className={`h-8 w-8 flex items-center justify-center text-sm rounded-full
            ${isSelected 
              ? 'bg-blue-600 text-white' 
              : isToday 
                ? 'bg-blue-100 text-blue-600' 
                : isValid 
                  ? 'text-gray-900 hover:bg-gray-100' 
                  : 'text-gray-400 cursor-not-allowed'}
            ${isValid ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const getYearOptions = () => {
    const currentYearActual = new Date().getFullYear();
    const startYear = minDate ? minDate.getFullYear() : currentYearActual - 10;
    const endYear = maxDate ? maxDate.getFullYear() : currentYearActual + 10;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
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
            className="w-full h-8 bg-transparent border-0 outline-none focus:outline-none text-sm text-gray-900 dark:text-gray-200 cursor-pointer p-1"
          />
          <span className="absolute right-4 top-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="absolute top-full left-0 right-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50 p-4 w-64">
          {/* Month/Year Selector */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <select
                value={currentMonth}
                onChange={(e) => handleMonthSelect(Number(e.target.value))}
                className="px-7 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 outline-none"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={(e) => handleYearSelect(Number(e.target.value))}
                className="px-6 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 outline-none"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleMonthChange(-1)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleMonthChange(1)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          {/* Today Button */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
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
              className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}