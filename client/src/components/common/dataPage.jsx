import React, { Component } from "react";
import FilteringPanel from "./filteringPanel";
import SearchBox from "./searchBox";
import PaginationController from "./paginationController";
import { paginate } from "../../utils/paginate";
import _ from "lodash";
import "./dataPage.css";

class DataPage extends Component {
  state = {
    data: [],
    searchQuery: "",
    currentPage: 1,
    pageSize: 10,
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
    let newData = data.map((item) => {
      if (item.gameName) {
        const { gameName, ...rest } = item;
        return { name: gameName, ...rest };
      }
      return item;
    });
    const transformedData = this.props.transformData
      ? this.props.transformData(newData)
      : newData;

    // Retrieve pageSize from localStorage, default to 10 if not found
    const storedPageSize = localStorage.getItem("pageSize");
    const pageSize = storedPageSize ? parseInt(storedPageSize, 10) : 10;

    this.setState({ data: transformedData, pageSize });
  }

  handleDelete = async (item) => {
    const { deleteHandler } = this.props;
    const { data } = this.state;

    // Make a copy of data and remove the item
    const originalData = [...data];
    const updatedData = data.filter((i) => i._id !== item._id);

    this.setState({ data: updatedData });

    try {
      // Call the appropriate delete handler passed via props
      await deleteHandler(item);
    } catch (ex) {
      this.setState({ data: originalData });
    }
  };

  handleLike = (item) => {
    const data = [...this.state.data];
    const index = data.findIndex((i) => i._id === item._id);
    data[index] = { ...data[index], liked: !data[index].liked };
    this.setState({ data });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handlePageSizeChange = (pageSize) => {
    if (pageSize >= 1 && pageSize <= 100) {
      this.setState({ pageSize, currentPage: 1 });

      // Store the selected page size in localStorage
      localStorage.setItem("pageSize", pageSize);
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
    const {
      data: allItems,
      currentPage,
      pageSize,
      sortColumn,
      searchQuery,
    } = this.state;

    let filteredItems = allItems;

    if (searchQuery)
      filteredItems = allItems.filter((item) =>
        item.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else filteredItems = this.applyFilters(allItems);

    // Apply sorting before sending data to DataTable
    const sortedItems = _.orderBy(filteredItems, [sortColumn.path], [sortColumn.order]);

    const paginatedItems = paginate(sortedItems, currentPage, pageSize);

    return { totalCount: filteredItems.length, data: paginatedItems };
  };

  render() {
    const { renderHeader, renderTable } = this.props;
    const { currentPage, pageSize, sortColumn, searchQuery, filter } = this.state;

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
              this.handleLike,
              this.handleDelete
            )}
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <PaginationController
              totalCount={totalCount}
              pageSize={pageSize}
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
