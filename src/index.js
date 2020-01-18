const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('./generated/prisma-client')
const users = require('./user/index.js')


const server = new GraphQLServer({
  typeDefs: [users.typeDefs],
  resolvers: [users.resolvers],
  context: request => {
    return {
      ...request,
      prisma
    }
  }
})
server.start(() => console.log(`Server is running on http://localhost:4000`))