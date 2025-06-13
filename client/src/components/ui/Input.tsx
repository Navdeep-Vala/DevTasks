import React from "react";
import type { InputHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
  label: string;
  error?: FieldError;
};

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <input
        className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500
        ${error ? "border-red-500" : "border-gray-300"}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
};

export default Input;
