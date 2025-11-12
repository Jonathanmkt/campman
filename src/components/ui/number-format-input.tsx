import * as React from "react";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export interface NumberFormatInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "format" | "value" | "defaultValue" | "onChange"> {
  value?: number | null;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
  allowDecimals?: boolean;
  decimalScale?: number;
  className?: string;
  step?: number;
  min?: number;
  max?: number;
  showStepButtons?: boolean;
}

const NumberFormatInput = React.forwardRef<HTMLInputElement, NumberFormatInputProps>(
  ({ 
    className, 
    onChange, 
    value, 
    defaultValue, 
    allowDecimals = true, 
    decimalScale = 2, 
    step = 1,
    min,
    max,
    showStepButtons = true,
    ...props 
  }, ref) => {
    const handleIncrement = () => {
      const currentValue = value ?? 0;
      const newValue = currentValue + step;
      if (max === undefined || newValue <= max) {
        onChange?.(newValue);
      }
    };

    const handleDecrement = () => {
      const currentValue = value ?? 0;
      const newValue = currentValue - step;
      if (min === undefined || newValue >= min) {
        onChange?.(newValue);
      }
    };

    return (
      <div className="relative">
        <NumericFormat
          customInput={Input}
          className={cn(className, showStepButtons && 'pr-7')}
          value={value ?? undefined}
          defaultValue={defaultValue}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={allowDecimals ? decimalScale : 0}
          allowNegative={false}
          onValueChange={(values) => {
            onChange?.(values.floatValue ?? null);
          }}
          {...props}
        />
        {showStepButtons && (
          <div className="absolute right-[1px] top-[1px] bottom-[1px] w-6 flex flex-col rounded-r-sm overflow-hidden">
            <button
              type="button"
              className="flex-1 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={handleIncrement}
              tabIndex={-1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path
                  fillRule="evenodd"
                  d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              onClick={handleDecrement}
              tabIndex={-1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }
);

NumberFormatInput.displayName = "NumberFormatInput";

export { NumberFormatInput };
