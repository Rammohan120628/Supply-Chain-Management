// QtyCell.tsx - Extract this as a separate component and import it in your table file

import React, { useState, useEffect } from "react";

interface QtyCellProps {
  index: number;
  item: any; // Replace with your actual item type
  recvdQtyErrors: Record<number, string>;
  handleQuantityChange: (itemId: string, value: string) => void;
  setRecvdQtyErrors: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

const formatWithThreeDecimals = (value: number | string): string => {
  if (typeof value === "string") {
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toFixed(3);
  }
  return value.toFixed(3);
};

export const QtyCell: React.FC<QtyCellProps> = ({
  index,
  item,
  recvdQtyErrors,
  handleQuantityChange,
  setRecvdQtyErrors,
}) => {
  const maxQuantity = item.maxQuantity || 0;
  const currentEditableValue = item.quantity || 0;
  const hasError = !!recvdQtyErrors[index];

  const [inputValue, setInputValue] = useState(
    formatWithThreeDecimals(currentEditableValue)
  );

  // Sync with external value changes only when not actively editing
  useEffect(() => {
    setInputValue(formatWithThreeDecimals(currentEditableValue));
  }, [currentEditableValue]);

  const isValidValue = (value: number): boolean => {
    return !isNaN(value) && value >= 0 && value <= maxQuantity;
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          const rawValue = e.target.value;

          // Handle empty input — allow user to clear the field
          if (rawValue === "") {
            setInputValue("");
            return;
          }

          // Allow only numbers and a single decimal point
          if (!/^[0-9]*\.?[0-9]*$/.test(rawValue)) {
            return; // Silently reject invalid characters
          }

          // Prepend 0 if input starts with a decimal point
          let processedValue = rawValue;
          if (rawValue === ".") {
            processedValue = "0.";
          } else if (rawValue.startsWith(".")) {
            processedValue = "0" + rawValue;
          }

          const numValue = parseFloat(processedValue);

          // If the parsed value exceeds max, clamp to maxQuantity
          if (!isNaN(numValue) && numValue > maxQuantity) {
            setInputValue(maxQuantity.toFixed(3));
          } else {
            // Allow partial inputs like "1", "1.", "1.5" while typing
            setInputValue(processedValue);
          }
        }}
        onKeyDown={(e) => {
          if (e.ctrlKey || e.metaKey) return;

          const allowedKeys = [
            "Backspace", "Delete", "ArrowLeft", "ArrowRight",
            "ArrowUp", "ArrowDown", "Tab", "Enter", "Escape", "Home", "End",
          ];

          if (allowedKeys.includes(e.key)) {
            if (e.key === "Enter") e.currentTarget.blur();
            return;
          }

          // Allow decimal point only if not already present
          if (e.key === ".") {
            if (e.currentTarget.value.includes(".")) {
              e.preventDefault();
            }
            return;
          }

          // Only allow digit keys
          if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            return;
          }

          // Predict the new value after this keystroke
          const currentValue = e.currentTarget.value;
          const selectionStart = e.currentTarget.selectionStart || 0;
          const selectionEnd = e.currentTarget.selectionEnd || 0;

          const newValueStr =
            selectionStart === selectionEnd
              ? currentValue.slice(0, selectionStart) + e.key + currentValue.slice(selectionStart)
              : currentValue.slice(0, selectionStart) + e.key + currentValue.slice(selectionEnd);

          if (newValueStr === "" || newValueStr === ".") return;

          const newValue = parseFloat(newValueStr);
          if (!isNaN(newValue) && newValue > maxQuantity) {
            e.preventDefault(); // Block keystroke that would exceed max
          }
        }}
        onBlur={(e) => {
          const rawValue = e.target.value;

          if (rawValue === "" || rawValue === "." || rawValue === "-") {
            handleQuantityChange(item.itemId!, "0");
            setInputValue("0.000");
            return;
          }

          const numValue = parseFloat(rawValue);

          if (!isNaN(numValue)) {
            if (numValue > maxQuantity) {
              setRecvdQtyErrors((prev) => ({
                ...prev,
                [index]: `Cannot exceed Remaining Batch Qty: ${maxQuantity.toFixed(3)}`,
              }));
              handleQuantityChange(item.itemId!, maxQuantity.toString());
              setInputValue(maxQuantity.toFixed(3));
            } else {
              // Clear any existing error for this index
              setRecvdQtyErrors((prev) => {
                const updated = { ...prev };
                delete updated[index];
                return updated;
              });
              handleQuantityChange(item.itemId!, numValue.toString());
              setInputValue(numValue.toFixed(3));
            }
          } else {
            handleQuantityChange(item.itemId!, currentEditableValue.toString());
            setInputValue(formatWithThreeDecimals(currentEditableValue));
          }
        }}
        className={`w-24 px-2 py-1 border rounded text-black text-center ${
          hasError
            ? "border-red-500 bg-red-50 text-red-700"
            : "border-gray-300"
        }`}
      />
      {hasError && (
        <div className="absolute z-10 mt-1 w-48 p-2 bg-red-100 border border-red-300 rounded-md shadow-lg text-sm text-red-700">
          {recvdQtyErrors[index]}
        </div>
      )}
    </div>
  );
};