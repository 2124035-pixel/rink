
import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  disabled: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder, disabled }) => {
  return (
    <div className="relative flex-grow flex flex-col">
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-grow w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        rows={10}
      />
      <div className="text-right text-sm text-slate-400 mt-2 pr-1">
        {value.length} 文字
      </div>
    </div>
  );
};

export default TextInput;
