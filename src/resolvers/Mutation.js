const { authenticate } = require('../utils.js')

const Mutation = {
  signUp: (root, args, context) => { 
    return authenticate(context).then(res => {
      return context.prisma.createUser({
        userId: args.userId,
        name: args.name,
        lastName: args.lastName,
        email: args.email
      })
    }).catch(error => {
        console.error(error)
        return error;
    })

  }
};

module.exports = { Mutation };
