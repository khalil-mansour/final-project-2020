const { authenticate } = require('../utils.js')

const Mutation = {
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

  }
};

module.exports = { Mutation };
