const {
  ApolloError,
  AuthenticationError,
  UserInputError,
} = require("apollo-server");
const validator = require("validator");

module.exports = {
  Post: {
    user: async ({ user }, args, { db }, info) => {
      return await db.User.findById(user).exec();
    }
  },
  Query: {
    async post(_, { postId }, { db }) {
      const post = await db.Post.findById(postId);
      if (!post) throw new ApolloError("No post.");
      return post;
    },
    async userPosts(_, { userId }, { db }) {
      const posts = await db.Post.find({ user: userId });
      if (!posts) throw new ApolloError("No posts.");
      return posts;
    },
    async posts(
      _,
      { postsPaginationInput: { cursor, limit = 2 } },
      { db }
    ) {
      const cursorOptions = cursor
        ? {
            createdAt: {
              $lt: cursor,
            },
          }
        : {};

      const posts = await db.Post.find(cursorOptions).sort({ createdAt: -1}).limit(limit + 1);
      const hasMore = posts.length > limit;
      const edges = hasMore ? posts.slice(0, -1) : posts;

      return {
        edges,
        pageInfo: {
          hasMore,
          endCursor: edges[edges.length - 1].createdAt
        }
      };
    },
  },
  Mutation: {
    async createPost(
      _,
      { postInput: { title, body } },
      { db, user: loggedInUser }
    ) {
      const errors = {};
      if (!loggedInUser) throw new AuthenticationError("Unauthorized access.");

      if (validator.isEmpty(title)) {
        errors.title = "Title must not be empty.";
        throw new UserInputError("Errors", { errors });
      }
      if (validator.isEmpty(body)) {
        errors.body = "Body must not be empty.";
        throw new UserInputError("Errors", { errors });
      }

      const newPost = await new db.Post({
        title,
        body,
        user: loggedInUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const updateUserPosts = await db.User.findById(loggedInUser.id);
      updateUserPosts.posts.push(newPost.id);
      updateUserPosts.save();

      const post = await newPost.save();
      return post;
    },
    async updatePost(
      _,
      { postInput: { postId, title, body } },
      { db, user: loggedInUser }
    ) {
      if (!loggedInUser) throw new AuthenticationError("Unauthorized access.");
      const post = await db.Post.findById(postId)
        .populate({ path: "user", select: "id" })
        .select("");
      if (!post) throw new UserInputError("No such post.");
      if (post.user.id !== loggedInUser.id)
        throw new AuthenticationError("Unauthorized access.");
      if (validator.isEmpty(title)) {
        errors.title = "Title must not be empty.";
        throw new UserInputError("Errors", { errors });
      }
      if (validator.isEmpty(body)) {
        errors.body = "Body must not be empty.";
        throw new UserInputError("Errors", { errors });
      }
      post.title = title;
      post.body = body;
      await post.save();
      return "Post updated successfully.";
    },
    async deletePost(_, { postId }, { db, user: loggedInUser }) {
      if (!loggedInUser) throw new AuthenticationError("Unauthorized access.");
      const post = await db.Post.findById(postId)
        .populate({ path: "user", select: "id" })
        .select("");
      if (!post) throw new UserInputError("No such post.");
      if (post.user.id !== loggedInUser.id)
        throw new AuthenticationError("Unauthorized access.");
      await post.delete();
      return "Post deleted successfully.";
    },
  },
};
