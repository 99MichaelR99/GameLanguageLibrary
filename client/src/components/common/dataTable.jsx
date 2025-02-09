import React from "react";
import Table from "./table";

const DataTable = ({ data, columnsConfig, sortColumn, onSort }) => {
  // Generate columns based on the provided configuration
  const columns = columnsConfig.map((col) => ({
    ...col,
    content: col.content ? col.content : (item) => item[col.path] || "No data",
  }));

  return (
    <Table
      data={data}
      columns={columns}
      sortColumn={sortColumn}
      onSort={onSort}
    />
  );
};

export default DataTable;
