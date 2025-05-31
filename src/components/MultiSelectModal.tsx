import React, { useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectModalProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  title?: string;
}

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  options,
  selected,
  onChange,
  placeholder = '請選擇',
  title,
}) => {
  const [open, setOpen] = useState(false);

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));

  return (
    <>
      <button className="btn w-full justify-between" onClick={() => setOpen(true)}>
        <span className="truncate flex-grow text-left">
          {selected.length === 0
            ? placeholder
            : `已選 ${selected.length}/${options.length}`}
        </span>
      </button>
      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((opt) => (
            <span key={opt.value} className="badge gap-1">
              {opt.label}
              <button
                type="button"
                className="ml-1"
                onClick={() => toggleOption(opt.value)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      {open && (
        <div className="modal modal-open">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
            {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
            <div className="max-h-60 overflow-auto space-y-2">
              {options.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggleOption(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onChange(options.map((o) => o.value))}
              >
                全選
              </button>
              <button type="button" className="btn btn-sm" onClick={() => onChange([])}>
                清空
              </button>
              <button className="btn btn-primary" onClick={() => setOpen(false)}>
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MultiSelectModal;
