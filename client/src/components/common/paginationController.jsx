import React from "react";
import Input from "./input";
import Pagination from "./pagination";

const PAGE_SIZES = [10, 25, 50]; // Define page sizes in a constant

const PaginationController = ({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div>
      <Pagination
        itemsCount={totalCount}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
      <div className="d-flex justify-content-center align-items-center mt-3 page-size-selector">
        <span className="mr-2">Page Size:</span>
        {PAGE_SIZES.map((size) => (
          <button
            key={size}
            className={`btn btn-outline-primary mx-2 ${
              size === pageSize ? "active" : ""
            }`} // Add active class for the selected page size
            onClick={() => onPageSizeChange(size)}
          >
            {size}
          </button>
        ))}
        <Input
          name="customPageSize"
          placeholder="Custom"
          type="number"
          min="1"
          max="100"
          onBlur={(event) => onPageSizeChange(parseInt(event.target.value, 10))}
          className="form-control d-inline-block mx-2"
          style={{ width: "100px" }} // Slightly wider input box
        />
      </div>
    </div>
  );
};

export default PaginationController;
