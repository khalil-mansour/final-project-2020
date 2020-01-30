const Mutation = {
  signUp: (root, args, context) => {
    return context.prisma.createUser({
      userId: args.userId,
      name: args.name,
      lastName: args.lastName,
      email: args.email
    })
  }
}

module.exports = { Mutation }