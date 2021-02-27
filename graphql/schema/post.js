const { gql } = require("apollo-server");

module.exports = gql`
  extend type Query {
    post(postId: ID!): Post
    userPosts(userId: ID!): [Post]
    posts(postsPaginationInput: postsPaginationInput): PostConnection!
  }

  extend type Mutation {
    createPost(postInput: CreatePostInput): Post!
    updatePost(postInput: CreatePostInput): String!
    deletePost(postId: ID!): String!
  }

  extend type Subscription {
    newPost: Post!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type PostConnection {
    edges: [Post!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasMore: Boolean!
    endCursor: String!
  }

  input postsPaginationInput {
    cursor: String
    limit: Int
  }

  input CreatePostInput {
    postId: ID
    title: String!
    body: String!
  }
`;
