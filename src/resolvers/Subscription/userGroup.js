const { authenticate, userBelongsToGroup  } = require('../../utils.js');

const userGroupSubscription = {
  userGroup: {
    subscribe: async (parent, args, context) => {
      try {
        const res = await authenticate(context);

        // make sure that the connected user is allowed to subscribe to the removals of the specified group
        if (!(await userBelongsToGroup(context, res.uid, args.input.groupId))) {
          throw new Error('The connected user is not allowed to subscribe to the changes of the specified group.');
        }

        return context.prisma.$subscribe.userGroup({
          mutation_in: ['CREATED', 'UPDATED', 'DELETED'],
          node: {
            id: args.input.groupId,
          },
        });

      } catch (error) {
        throw new Error(error.message);
      }            
    },
    resolve: (payload) => payload,
  },
};

module.exports = { userGroupSubscription };