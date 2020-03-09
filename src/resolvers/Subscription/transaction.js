const { authenticate, userBelongsToGroup } = require('../../utils.js');

const transactionSubscription = {
  transaction: {
    subscribe: async (parent, args, context) => {
      try {
        const res = await authenticate(context);

        // make sure that the connected user is allowed to subscribe to the transactions of the specified group
        if (await userBelongsToGroup(context, res.uid, args.input.groupId)) {
          return context.prisma.$subscribe.transaction({
            mutation_in: ['CREATED', 'UPDATED', 'DELETED'],
            node: {
              group: {
                id: args.input.groupId,
              },
            },
          });
        }
        throw new Error('The connected user is not allowed to subscribe to the transactions of the specified group.');
      } catch (error) {
        throw new Error(error.message);
      }
    },
    resolve: (payload) => payload,
  },
};

module.exports = { transactionSubscription };