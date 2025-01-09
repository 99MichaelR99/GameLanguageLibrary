import React, { Component } from "react";
import { toast } from "react-toastify";
import FilteringPanel from "./common/filteringPanel";
import PostTable from "./postsTable";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getPosts, deletePost } from "../services/postService";
import { Link } from "react-router-dom";
import _ from "lodash";

class PostPage extends Component {
  state = {
    posts: [],
    searchQuery: "",
    currentPage: 1,
    pageSize: 10,
    sortColumn: { path: "gameName", order: "asc" },
    filter: {
      showFilters: false,
      platforms: [],
      voiceLanguages: [],
      subtitlesLanguages: [],
    },
  };

  async componentDidMount() {
    const { data: posts } = await getPosts();
    this.setState({ posts });
  }

  handleDelete = async (post) => {
    const originalPosts = this.state.posts;
    const posts = originalPosts.filter((p) => p._id !== post._id);
    this.setState({ posts });

    try {
      await deletePost(post._id);
    } catch (ex) {
      toast.error("Could not delete the post.");
      this.setState({ posts: originalPosts });
    }
  };

  handleLike = (post) => {
    const posts = [...this.state.posts];
    const index = posts.findIndex((p) => p._id === post._id);
    posts[index] = { ...posts[index], liked: !posts[index].liked };
    this.setState({ posts });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, currentPage: 1 });
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

      if (updatedFilters[type].includes(value)) {
        updatedFilters[type] = updatedFilters[type].filter(
          (item) => item !== value
        );
      } else {
        updatedFilters[type] = [...updatedFilters[type], value];
      }

      return { filter: updatedFilters, currentPage: 1, searchQuery: "" };
    });
  };

  getPageData = () => {
    const {
      posts: allPosts,
      currentPage,
      pageSize,
      sortColumn,
      searchQuery,
    } = this.state;

    let filteredPosts = allPosts;

    if (searchQuery)
      filteredPosts = allPosts.filter((p) =>
        p.gameName.toLowerCase().startsWith(searchQuery.toLowerCase())
      );

    const sortedPosts = _.orderBy(
      filteredPosts,
      [sortColumn.path],
      [sortColumn.order]
    );

    const paginatedPosts = paginate(sortedPosts, currentPage, pageSize);

    return { totalCount: filteredPosts.length, data: paginatedPosts };
  };

  render() {
    const { user } = this.props;
    const { currentPage, pageSize, sortColumn, searchQuery, filter } =
      this.state;

    const { totalCount, data } = this.getPageData();

    return (
      <div className="post-page-container d-flex flex-wrap justify-content-center">
        <div className="col-md-3 col-lg-2 sidebar">
          {user && (
            <Link to="/posts/new" className="btn btn-primary mb-3">
              New Post
            </Link>
          )}
          <button
            className="btn btn-info toggle-button mb-3"
            onClick={this.handleFilterToggle}
          >
            {filter.showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {filter.showFilters && (
            <FilteringPanel
              filter={filter}
              onFilterChange={this.handleFilterChange}
            />
          )}
        </div>
        <div className="col main-content flex-grow-1">
          <div className="d-flex justify-content-between align-items-center">
            <SearchBox value={searchQuery} onChange={this.handleSearch} />
          </div>
          <PostTable
            posts={data}
            sortColumn={sortColumn}
            onSort={this.handleSort}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
          />
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <p className="results-count m-0"> {totalCount} Results</p>
            <Pagination
              itemsCount={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default PostPage;

/*import React from "react";
import { useNavigate } from "react-router-dom";

const Posts = () => {
  const navigate = useNavigate();

  return (
    <div className="row">
      <h1>Posts</h1>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/posts/new")}
      >
        Add Post
      </button>
    </div>
  );
};

export default Posts;*/
