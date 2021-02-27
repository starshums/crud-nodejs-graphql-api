const { gql } = require("apollo-server");

module.exports = gql`
  extend type Query {
    me: User
    user(userId: ID!): User
    users: [User]
  }

  extend type Mutation {
    register(registerInput: RegisterUserInput): User!
    login(loginInput: LoginUserInput): User!
  }

  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    posts: [Post]!
    createdAt: String!
    updatedAt: String!
  }

  input RegisterUserInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  input LoginUserInput {
    email: String!
    password: String!
  }
`;
