const chatSubscription = {
  message: {
    subscribe: async (parent, args, context) => {
      try {
        return context.prisma.$subscribe.message({
          mutation_in: ['CREATED', 'UPDATED'],
          node: {
            chatroom: {
              id: args.input.chatroomId,
            },
          },
        });
      } catch (e) {
        throw new Error('Erreur lors du subscribe');
      }
    },
    resolve: (payload) => payload,
  },
};

module.exports = { chatSubscription };
