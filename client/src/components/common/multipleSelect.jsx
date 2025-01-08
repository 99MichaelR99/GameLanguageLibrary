import React from "react";
import "./multipleSelect.css";

const MultipleSelect = ({
  data,
  multiSelectState,
  name,
  label,
  options,
  toggleMultiSelect,
  handleMultiSelect,
  disabled,
}) => {
  const isOpen = multiSelectState[name];

  return (
    <div className="multiple-select-container">
      <label>{label}</label>
      <div
        className={`multiple-select-box ${disabled ? "disabled" : ""}`}
        onClick={disabled ? undefined : () => toggleMultiSelect(name)}
      >
        {data[name]?.length > 0
          ? data[name].join(", ")
          : `Select ${label.toLowerCase()}`}
      </div>
      {isOpen && !disabled && (
        <ul className="multiple-select-list">
          {options.map((option) => (
            <li
              key={option}
              className={data[name]?.includes(option) ? "selected" : ""}
              onClick={
                disabled ? undefined : () => handleMultiSelect(name, option)
              }
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MultipleSelect;
