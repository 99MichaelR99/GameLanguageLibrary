import React from "react";
import "./dropDownBox.css";

const Dropdown = ({
  data,
  dropdownStates,
  name,
  label,
  options,
  toggleDropdown,
  handleDropdownSelect,
}) => {
  const isOpen = dropdownStates[name];

  return (
    <div className="dropdown-container">
      <label>{label}</label>
      <div className="dropdown-box" onClick={() => toggleDropdown(name)}>
        {data[name]?.length > 0
          ? data[name].join(", ")
          : `Select ${label.toLowerCase()}`}
      </div>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((option) => (
            <li
              key={option}
              className={data[name]?.includes(option) ? "selected" : ""}
              onClick={() => handleDropdownSelect(name, option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
