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
}) => {
  const isOpen = multiSelectState[name];

  return (
    <div className="multiple-select-container">
      <label>{label}</label>
      <div
        className={`multiple-select-box`}
        onClick={() => toggleMultiSelect(name)}
      >
        {data[name]?.length > 0
          ? data[name].join(", ")
          : `Select ${label.toLowerCase()}`}
      </div>
      {isOpen && (
        <ul className="multiple-select-list">
          {options.map((option) => (
            <li
              key={option}
              className={data[name]?.includes(option) ? "selected" : ""}
              onClick={() => handleMultiSelect(name, option)}
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
