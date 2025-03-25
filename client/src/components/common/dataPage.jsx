import React, { Component } from "react";
import AuthContext from "../../context/authContext"; // Import AuthContext
import FilteringPanel from "./filteringPanel";
import SearchBox from "./searchBox";
import PaginationController from "./paginationController";
import { paginate } from "../../utils/paginate";
import _ from "lodash";
import "./dataPage.css";

class DataPage extends Component {
  static contextType = AuthContext; // Set contextType to AuthContext

  state = {
    data: [],
    searchQuery: "",
    currentPage: 1,
    sortColumn: { path: "name", order: "asc" },
    filter: {
      showFilters: false,
      platforms: [],
      voiceLanguages: [],
      subtitlesLanguages: [],
    },
  };

  async componentDidMount() {
    const { data } = await this.props.getData();
    /*let newData = data.map((item) => {
      if (item.gameName) {
        const { gameName, ...rest } = item;
        return { name: gameName, ...rest };
      }
      return item;
    });
    const transformedData = this.props.transformData
      ? this.props.transformData(newData)
      : newData;*/

    const transformedData = this.props.transformData
      ? this.props.transformData(
          data.map(({ gameName, ...rest }) =>
            gameName ? { name: gameName, ...rest } : { ...rest }
          )
        )
      : data;

    this.setState({ data: transformedData });
  }

  handleDelete = async (item) => {
    const { deleteHandler } = this.props;
    const { data } = this.state;

    const originalData = [...data];
    const updatedData = data.filter((i) => i._id !== item._id);

    this.setState({ data: updatedData });

    try {
      await deleteHandler(item);
    } catch (ex) {
      this.setState({ data: originalData });
    }
  };

  handleFavorite = (item) => {
    const data = [...this.state.data];
    const index = data.findIndex((i) => i._id === item._id);
    data[index] = { ...data[index], liked: !data[index].liked };
    this.setState({ data });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handlePageSizeChange = (newPageSize) => {
    if (newPageSize >= 1 && newPageSize <= 100) {
      this.setState({ currentPage: 1 });

      // Update pageSize via AuthContext (this.context)
      if (this.context.updatePageSize) {
        this.context.updatePageSize(newPageSize);
      } else {
        console.error("updatePageSize is not defined in AuthContext");
      }
    }
  };

  handleSearch = (query) => {
    const { showFilters } = this.state.filter;
    this.setState({
      searchQuery: query,
      currentPage: 1,
      filter: {
        showFilters: showFilters,
        platforms: [],
        voiceLanguages: [],
        subtitlesLanguages: [],
      },
    });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleFilterToggle = () => {
    this.setState((prevState) => ({
      filter: {
        ...prevState.filter,
        showFilters: !prevState.filter.showFilters,
      },
    }));
  };

  handleFilterChange = (type, value) => {
    this.setState((prevState) => {
      const updatedFilters = { ...prevState.filter };

      if (!updatedFilters[type]) return;

      updatedFilters[type] = updatedFilters[type].includes(value)
        ? updatedFilters[type].filter((item) => item !== value)
        : [...updatedFilters[type], value];

      return { filter: updatedFilters, currentPage: 1, searchQuery: "" };
    });
  };

  applyFilters = (items) => {
    const { platforms, voiceLanguages, subtitlesLanguages } = this.state.filter;

    return items.filter((item) => {
      const platformMatch =
        platforms.length === 0 || platforms.includes(item.platform);
      const voiceLanguageMatch =
        voiceLanguages.length === 0 ||
        item.voiceLanguages.some((lang) => voiceLanguages.includes(lang));
      const subtitlesLanguageMatch =
        subtitlesLanguages.length === 0 ||
        item.subtitlesLanguages.some((lang) =>
          subtitlesLanguages.includes(lang)
        );

      return platformMatch && voiceLanguageMatch && subtitlesLanguageMatch;
    });
  };

  getPageData = () => {
    const { data: allItems, currentPage, sortColumn, searchQuery } = this.state;
    const { pageSize } = this.context; // Get pageSize from AuthContext

    let filteredItems = allItems;

    if (searchQuery)
      filteredItems = allItems.filter((item) =>
        item.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else filteredItems = this.applyFilters(allItems);

    const sortedItems = _.orderBy(
      filteredItems,
      [sortColumn.path],
      [sortColumn.order]
    );

    const paginatedItems = paginate(sortedItems, currentPage, pageSize);

    return { totalCount: filteredItems.length, data: paginatedItems };
  };

  render() {
    const { renderHeader, renderTable } = this.props;
    const { currentPage, sortColumn, searchQuery, filter } = this.state;
    const { pageSize } = this.context; // Get pageSize from AuthContext

    const { totalCount, data } = this.getPageData();

    return (
      <div className="data-page-container d-flex flex-wrap justify-content-center">
        <div className="col-md-3 col-lg-2 sidebar">
          {renderHeader && renderHeader()}
          <FilteringPanel
            filter={filter}
            onFilterToggle={this.handleFilterToggle}
            onFilterChange={this.handleFilterChange}
          />
        </div>

        <div className="col main-content flex-grow-1">
          <SearchBox value={searchQuery} onChange={this.handleSearch} />
          {renderTable &&
            renderTable(
              data,
              sortColumn,
              this.handleSort,
              this.handleFavorite,
              this.handleDelete
            )}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <PaginationController
              totalCount={totalCount}
              pageSize={pageSize} // Use pageSize from AuthContext
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
              onPageSizeChange={this.handlePageSizeChange}
            />
            <p className="results-count m-0">{totalCount} Results</p>
          </div>
        </div>
      </div>
    );
  }
}

export default DataPage;
