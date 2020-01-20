const { user } = require("./user.js");
const { resolvers } = require("./resolvers.js");
const { typeDefs } = require("./typeDefs.js");

module.exports = {
    user,
    resolvers,
    typeDefs
};