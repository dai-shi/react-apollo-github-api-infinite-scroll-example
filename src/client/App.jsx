import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { composeWithState } from 'react-compose-state';
import InfiniteScroll from 'react-infinite-scroller';

const RepoList = ({
  data: {
    loading, error, search, loadMore,
  },
}) => {
  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div>
        <p>Not Logged In</p>
        <a href="/auth/github">Log in with GitHub</a>
      </div>
    );
  }
  const {
    nodes = [],
    pageInfo: { hasNextPage } = {},
  } = search || {};
  return (
    <InfiniteScroll
      loadMore={loadMore}
      hasMore={hasNextPage}
      loader={<p>Loading...</p>}
    >
      <ul>
        {nodes.map(item => (
          <li key={item.url}><a href={item.url}>{item.name}</a></li>
        ))}
      </ul>
    </InfiniteScroll>
  );
};

const QUERY_REPOS = gql`
query ($q: String!, $end: String) {
  search(first: 20, type: REPOSITORY, query: $q, after: $end) {
    nodes {
      ... on Repository {
        name
        url
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
`;

const withQuery = graphql(QUERY_REPOS, {
  options: ({ q }) => ({ variables: { q } }),
  props: ({ data }) => ({
    data: {
      ...data,
      loadMore: () => data.fetchMore({
        variables: { end: data.search.pageInfo.endCursor },
        updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
          const previousSearch = previousResult.search || {};
          const currentSearch = fetchMoreResult.search || {};
          const previousNodes = previousSearch.nodes || [];
          const currentNodes = currentSearch.nodes || [];
          return {
            ...previousResult,
            search: {
              ...previousSearch,
              nodes: [...previousNodes, ...currentNodes],
              pageInfo: currentSearch.pageInfo,
            },
          };
        },
      }),
    },
  }),
});

const RepoListWithQuery = withQuery(RepoList);

const App = ({ searchKeyword, setSearchKeyword }) => (
  <div>
    <input
      value={searchKeyword}
      onChange={evt => setSearchKeyword(evt.target.value)}
    />
    <RepoListWithQuery q={searchKeyword} />
  </div>
);

const withState = composeWithState({ searchKeyword: '' });

export default withState(App);
