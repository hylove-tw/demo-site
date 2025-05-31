import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder = '請選擇',
}) => {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedLabels = options
    .filter((opt) => selected.includes(opt.value))
    .map((opt) => opt.label)
    .join(', ');

  return (
    <div
      className={`dropdown w-full${open ? ' dropdown-open' : ''}`}
      tabIndex={0}
      onBlur={() => setOpen(false)}
    >
      <div
        className="btn w-full justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate flex-grow text-left">
          {selected.length === 0 ? placeholder : selectedLabels}
        </span>
        <svg
          className="fill-current inline-block h-4 w-4 ml-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </div>
      {open && (
        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box max-h-60 overflow-auto w-full">
          {options.map((opt) => (
            <li key={opt.value} className="px-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
