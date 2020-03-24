const { authenticate } = require('../../utils.js');
const { Query } = require('../Query.js');
const { Invitation } = require('../Invitation.js');

const invitationMutation = {
  createInvitation: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // fetch user by uid
      const user = await Query.userByFirebase(root, res.uid, context);
      // check if user is in group
      const exists = await context.prisma.$exists.userGroup({
        user: { id: user.id },
        group: { id: args.input.groupId },
      });
      if (exists) {
        return context.prisma.createInvitation({
          from: { connect: { id: user.id } },
          group: { connect: { id: args.input.groupId } },
          link: args.input.link,
          expiredAt: args.input.expiredAt,
        });
      }
      throw new Error('User sending invite not in current group');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  acceptInvitation: async (root, args, context) => {
    try {
      const fragment = `
      fragment invitationWithGroup on Group {
        id
        name
        chatroom { id }
      }`;
      const res = await authenticate(context);
      // fetch user by uid
      res.uid = 'tT8tv8UXt2MSJiXoO5GoWFBfU0v2';
      const user = await Query.userByFirebase(root, res.uid, context);
      // fetch invitation by id
      const invitation = await Query.invitation(root, args.input, context);
      // fetch group linked to invitation
      const invitationGroup = await Invitation.group(invitation, res, context);
      const group = await context.prisma.group({
        id: invitationGroup.id,
      }).$fragment(fragment);

      // check if user already in group
      const exists = await context.prisma.$exists.userGroup({
        user: { id: user.id },
        group: { id: group.id },
      });

      if (!exists) {
        await context.prisma.createUserChatroom(
          {
            user: { connect: { id: user.id } },
            chatroom: { connect: { id: group.chatroom.id } },
          },
        );

        return context.prisma.createUserGroup({
          user: { connect: { id: user.id } },
          group: { connect: { id: group.id } },
          join_at: new Date().toUTCString(),
        });
      }
      throw new Error('User is already a member of the group');
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { invitationMutation };
