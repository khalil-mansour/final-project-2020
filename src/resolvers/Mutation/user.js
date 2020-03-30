const { authenticate } = require('../../utils.js');
const { Query } = require('../Query/Query.js');

const userMutation = {
  signUp: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      return context.prisma.createUser({
        name: args.input.name,
        firebaseId: res.uid,
        lastName: args.input.lastName,
        email: args.input.email,
        avatar: args.input.avatar,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  assignTypeToUser: (root, args, context) => context.prisma.updateUser({
    id: args.input.id,
    type: args.input.type,
  }),

  updateUser: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // fetch current user by uid
      const user = await Query.userByFirebase(root, { firebaseId: res.uid }, context);
      return context.prisma.updateUser({
        data: {
          name: args.input.name,
          lastName: args.input.lastName,
          email: args.input.email,
          avatar: args.input.avatar,
        },
        where: {
          id: user.id,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { userMutation };
