const chat = {

  // Create a chatroom
  createChatroom: (root, args, context) => context.prisma.createChatroom({
    name: args.name,
  }),
  // Deactivate a chatroom
  deactivateChatroom: (root, args, context) => context.prisma.updateChatroom({
    data: {
      isArchived: true,
    },
    where: {
      id: args.id,
    },
  }),
  // Activate a chatrrom
  activateChatroom: (root, args, context) => context.prisma.updateChatroom({
    data: {
      isArchived: false,
    },
    where: {
      id: args.id,
    },
  }),
  // Enter a chatroom
  joinChatroom: (root, args, context) => context.prisma.createUserChatroom(
    {
      user: {
        connect:
        {
          id: args.userId,
        },
      },
      chatroom: {
        connect:
        {
          id: args.chatroomId,
        },
      },
    },
  ),

  // Leave a chatroom
  leaveChatroom: (root, args, context) => context.prisma.updateUserChatroom({
    data: {
      leftDate: Date.now(),
    },
    where: {
      id: args.id,
    },
  }),
  // Send a message
  sendMessage: (root, args, context) => context.prisma.createMessage({
    content: args.content,
    userId: args.userId,
    chatroomId: args.chatroomId,
  }),
  // Update a message
  editMessage: (root, args, context) => context.prisma.updateMessage({
    data: {
      content: args.content,
    },
    where: {
      AND: {
        userId: args.userId,
        chatroomId: args.chatroomId,
      },
    },
  }),
  // Delete a message
  deleteMessage: (root, args, context) => context.prisma.updateMessage({
    data: {
      deletedAt: Date.now(),
    },
    where: {
      AND: {
        userId: args.userId,
        chatroomId: args.chatroomId,
      },
    },
  }),
};

module.exports = { chat };
