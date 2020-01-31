const { authenticate } = require('../../utils.js')

const resolvers = {
  Query: {
    users: (context) => {
      return context.prisma.users()
    }, 
  },
  Mutation: {
    signUp: (root, args, context) => {
      authenticate(context).then(res => {
        return context.prisma.createUser({
          userId: args.userId,
          name: args.name,
          lastName: args.lastName,
          email: args.email
        })
      }).catch(error => {
          console.log(error)
          throw error
      })
    },
    login: (root, args, context) => {

    }
  }
}

module.exports = { resolvers }
