import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import "./CustomSelect.scss";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select ${isOpen ? "open" : ""}`} ref={selectRef}>
      <div className="select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="select-value">
          {icon && <span className="select-icon">{icon}</span>}
          <span className="select-text">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <FaChevronDown className={`chevron-icon ${isOpen ? "rotate" : ""}`} />
      </div>

      {isOpen && (
        <div className="select-dropdown">
          <div className="dropdown-scroll">
            {options.map((option) => (
              <div
                key={option.value}
                className={`dropdown-item ${
                  value === option.value ? "selected" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span className="item-label">{option.label}</span>
                {value === option.value && <FaCheck className="check-icon" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
