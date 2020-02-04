const { authenticate } = require('../utils.js');

const Query = {
  users: (root, args, context) => context.prisma.users(),
  login: (root, args, context) => authenticate(context)
    .then(() => context.prisma.$exists.user({userId: args.userId}) 
    )
    .catch((error) => {
      console.error(error);
      return error;
    }),
    
};

module.exports = { Query };
