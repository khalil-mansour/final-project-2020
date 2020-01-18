const {User} = require("./User")

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

module.exports = { resolvers }
