import React, { Component } from "react";
import Table from "./table";

class DataTable extends Component {
  constructor(props) {
    super(props);

    const { columnsConfig } = this.props;

    // Generate columns based on the provided configuration
    this.columns = columnsConfig.map((col) => ({
      ...col,
      content: col.content
        ? col.content
        : (item) => item[col.path] || "No data",
    }));
  }

  render() {
    const { data, sortColumn, onSort } = this.props;

    return (
      <Table
        data={data}
        columns={this.columns}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default DataTable;
