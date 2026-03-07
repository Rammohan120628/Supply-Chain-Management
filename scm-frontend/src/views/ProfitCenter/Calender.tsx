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
    showMonthYearPicker?: boolean; 
      dateFormat?: string;  
};

export default function CalendarDatePicker({
  id,
  onChange,
  label,
  selected,
  minDate,
  maxDate,
  className = "",
  required = false,
  placeholder,
  placeholderText,
  
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
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

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
    if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) return false;
    if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) return false;
    return true;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', {
      month: '2-digit',
      year: 'numeric'
    });
  };

  // const handleMonthYearSelect = () => {
  //   const newDate = new Date(currentYear, currentMonth, 1);
  //   if (isDateValid(newDate)) {
  //     setSelectedDate(newDate);
  //     setIsOpen(false);
  //     if (onChange) {
  //       onChange(newDate);
  //     }
  //   }
  // };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(month);
    const newDate = new Date(currentYear, month, 1);
    if (isDateValid(newDate)) {
      setSelectedDate(newDate);
      if (onChange) {
        onChange(newDate);
      }
    }
  };

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    const newDate = new Date(year, currentMonth, 1);
    if (isDateValid(newDate)) {
      setSelectedDate(newDate);
      if (onChange) {
        onChange(newDate);
      }
    }
  };

  const getYearOptions = () => {
    const currentYearActual = new Date().getFullYear();
    const startYear = minDate ? minDate.getFullYear() : currentYearActual - 10;
    const endYear = maxDate ? maxDate.getFullYear() : currentYearActual + 5;
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
            placeholder={placeholder || placeholderText || "mm-yyyy"}
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
          <div className="flex gap-2 mb-4">
            <select
              value={currentMonth}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
              className="flex-[4] px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-gray-200 outline-none focus:border-blue-500"
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
              className="flex-[3] px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent text-gray-900 dark:text-gray-200 outline-none focus:border-blue-500"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            {/* <button
              onClick={handleMonthYearSelect}
              className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}