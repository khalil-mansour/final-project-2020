const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('./generated/prisma-client')
const { User } = require('./user/index')


//trouver une facon d'utiliser le resolver de user et le schema
const resolvers = {
  Query: {
    users: (context) => {
      return context.prisma.users()
    }, 
  },
  Mutation: {
    signUp: (root, args, context) => {
      return context.prisma.createUser({
        userId: args.userId,
        name: args.name,
        lastName: args.name,
        email: args.email
      })
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/user/userSchema.graphql',
  resolvers,
  context: { prisma }
})
server.start(() => console.log(`Server is running on http://localhost:4000`))