import React, { useState } from "react";

const SearchableSelect = ({ name, label, options, value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue) => {
    onChange({ target: { name, value: selectedValue } });
    setIsOpen(false);
  };

  return (
    <div className="form-group position-relative">
      <label>{label}</label>
      <input
        type="text"
        className="form-control"
        value={searchTerm}
        placeholder="Search..."
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <ul
          className="dropdown-menu show w-100"
          style={{ maxHeight: "200px", overflowY: "auto" }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className="dropdown-item"
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="dropdown-item disabled">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
