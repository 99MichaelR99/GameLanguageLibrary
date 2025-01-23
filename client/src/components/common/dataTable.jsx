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

    // Default sortColumn state
    this.state = {
      sortColumn: this.props.sortColumn || { path: "name", order: "asc" },
    };
  }

  handleSort = (column) => {
    this.setState({ sortColumn: column });
  };

  render() {
    const { data } = this.props;
    const { sortColumn } = this.state;

    return (
      <Table
        data={data}
        columns={this.columns}
        sortColumn={sortColumn}
        onSort={this.props.onSort || this.handleSort}
      />
    );
  }
}

export default DataTable;
