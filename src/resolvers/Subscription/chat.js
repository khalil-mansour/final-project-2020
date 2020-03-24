const chatSubscription = {
  message: {
    subscribe: async (parent, args, context) => context.prisma.$subscribe.message({
      mutation_in: ['CREATED', 'UPDATED', 'DELETED'],
      node: {
        chatroom: {
          id: args.input.id,
        },
      },
    }),
    resolve: (payload) => payload,
  },
};

module.exports = { chatSubscription };
