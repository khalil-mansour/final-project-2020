const { user } = require("./user.js");
const { typeDefs } = require("./typeDefs.js");

const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')

const resolvers = {
  Query,
  Mutation,
  Subscription,
};

module.exports = {
  user,
  resolvers,
  typeDefs
};