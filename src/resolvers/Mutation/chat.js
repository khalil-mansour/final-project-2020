const getUserChatroomById = async (args, context) => {
  const chatrooms = await context.prisma.userChatrooms({
    where: {
      user: {
        id: args.input.userId,
      },
      chatroom: {
        id: args.input.chatroomId,
      },
    },
  });
  if (chatrooms.length > 1) {
    throw new Error('A user join a Chatroom multiple times. something is wrong');
  } else {
    return chatrooms[0];
  }
};
const chat = {

  // Create a chatroom
  createChatroom: (root, args, context) => context.prisma.createChatroom({
    name: args.input.name,
  }),
  // Deactivate a chatroom
  deactivateChatroom: (root, args, context) => context.prisma.updateChatroom({
    data: {
      isArchived: true,
    },
    where: {
      id: args.input.id,
    },
  }),
  // Activate a chatrrom
  activateChatroom: (root, args, context) => context.prisma.updateChatroom({
    data: {
      isArchived: false,
    },
    where: {
      id: args.input.id,
    },
  }),
  // Enter a chatroom
  joinChatroom: async (root, args, context) => {
    const chatroom = await getUserChatroomById(args, context);
    if (chatroom) {
      throw new Error('A user cannot join a Chatroom multiple times');
    }
    return context.prisma.createUserChatroom(
      {
        user: {
          connect:
        {
          id: args.input.userId,
        },
        },
        chatroom: {
          connect:
        {
          id: args.input.chatroomId,
        },
        },
      },
    );
  },
  // Leave a chatroom
  leaveChatroom: async (root, args, context) => {
    const dateTime = new Date().toUTCString();
    const chatroom = await getUserChatroomById(args, context);

    return context.prisma.updateUserChatroom({
      data: {
        leftDate: dateTime,
      },
      where: {
        id: chatroom.id,
      },
    });
  },
  // Send a message
  sendMessage: (root, args, context) => context.prisma.createMessage({
    content: args.input.content,
    user: {
      connect: {
        firebaseId: args.input.userId,
      },
    },
    chatroom: {
      connect: {
        id: args.input.chatroomId,
      },
    },
  }),
  // Update a message
  editMessage: (root, args, context) => context.prisma.updateMessage({
    data: {
      content: args.input.content,
    },
    where: {
      id: args.input.id,
    },
  }),
  // Delete a message
  deleteMessage: (root, args, context) => {
    const date = new Date().toUTCString();
    return context.prisma.updateMessage({
      data: {
        deletedAt: date,
      },
      where: {
        id: args.input.id,
      },
    });
  },
};

module.exports = { chat };
