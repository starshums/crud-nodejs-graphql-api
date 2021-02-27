const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

const checkUser = require("./utils/auth");
const resolvers = require("./graphql/resolvers");
const typeDefs = require("./graphql/schema");
const db = require("./models");
const { PORT, MONGO_URI } = require("./utils/constants");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    let user;
    try {
      user = await checkUser(req);
    } catch (err) {}
    return { db, user };
  },
});

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("🚀 MongoDB database connected.");
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`🚀 Server ready at ${res.url}`);
  });
