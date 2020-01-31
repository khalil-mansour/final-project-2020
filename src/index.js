const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('./generated/prisma-client')
const user = require('./models/user/index.js')

const server = new GraphQLServer({
  typeDefs: [user.typeDefs],
  resolvers: [user.resolvers],
  context: request => {
    return {
      ...request,
      prisma,
    }
  }, 
})

server.start(() => console.log(`Server is running on http://localhost:4000`))