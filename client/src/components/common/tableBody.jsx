import React, { Component } from "react";
import _ from "lodash";

class TableBody extends Component {
  renderCell = (item, column) => {
    // If the column has a `content` function, use it to render the cell
    if (column.content) return column.content(item);

    // Otherwise, retrieve the value from the item based on the column path
    return _.get(item, column.path);
  };

  createKey = (item, column) => {
    return `${item._id + (column.path || column.key)}`;
  };

  render() {
    const { data, columns } = this.props;

    return (
      <tbody>
        {data.map((item) => (
          <tr key={item.code}>
            {columns.map((column) => (
              <td key={this.createKey(item, column)}>
                {this.renderCell(item, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }
}

export default TableBody;
