const { authenticate, userBelongsToGroup } = require('../../utils.js');
const { Query } = require('../Query/Query.js');
const { Group } = require('../Group');
const { invitationMutation } = require('./invitation.js');
const { getUserChatroomById } = require('./chat');

async function getUserGroup(user, group, context) {
  return context.prisma.userGroups({
    where: {
      user: { firebaseId: user },
      group: { id: group },
    },
  });
}

const groupMutation = {
  createGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      const fragment = `
      fragment groupWithChatroom on Group {
        id
        name
        chatroom { id }
      }`;
      const group = await context.prisma.createGroup(
        {
          users: {
            create: {
              user: { connect: { firebaseId: res.uid } },
              role: { connect: { type: args.input.role } },
            },
          },
          name: args.input.name,
          admin: { connect: { firebaseId: res.uid } },
          address: {
            create: {
              country: '',
              province: '',
              city: '',
              street: '',
              apartmentUnit: '',
              postalCode: '',
            },
          },
          chatroom: {
            create: {
              name: `${args.input.name} chat`,
            },
          },
        },
      ).$fragment(fragment);

      await context.prisma.createUserChatroom({
        user: { connect: { firebaseId: res.uid } },
        chatroom: { connect: { id: group.chatroom.id } },
      });


      // create initial landlord invitation for group
      await invitationMutation.createInvitation(
        root,
        {
          input: {
            groupId: group.id,
            role: 'landlord',
          },
        },
        context,
      );

      // create initial tenant invitation for group
      await invitationMutation.createInvitation(
        root,
        {
          input: {
            groupId: group.id,
            role: 'tenant',
          },
        },
        context,
      );

      return group;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  joinGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      const fragment = `
      fragment groupWithChatroom on Group {
        id
        chatroom { id }
      }`;

      // fetch group
      const group = await context.prisma.invitation({ code: args.input.code })
        .group()
        .$fragment(fragment);
      // check if group exists for code
      if (!group) {
        throw new Error('Invalid code !');
      }

      // check if user is already in group
      if (await userBelongsToGroup(context, res.uid, group.id)) {
        throw new Error('User already in group !');
      }

      // fetch role by code
      const role = await context.prisma.invitation({ code: args.input.code }).role();

      await context.prisma.createUserChatroom({
        user: { connect: { firebaseId: res.uid } },
        chatroom: { connect: { id: group.chatroom.id } },
      });

      return context.prisma.createUserGroup({
        user: { connect: { firebaseId: res.uid } },
        group: { connect: { id: group.id } },
        role: { connect: { type: role.type } },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateGroupName: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // check if user is in group
      const exists = await context.prisma.$exists.userGroup({
        user: { firebaseId: res.uid },
        group: { id: args.input.groupId },
      });
      // if user in group, update group
      if (exists) {
        return context.prisma.updateGroup({
          data: {
            name: args.input.name,
          },
          where: {
            id: args.input.groupId,
          },
        });
      }
      // else throw new error : user not in group
      throw new Error('User not in group');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateGroupInfo: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // check if user is in group
      const exists = await context.prisma.$exists.userGroup({
        user: { firebaseId: res.uid },
        group: { id: args.input.groupId },
      });

      // if user in group, update group
      if (exists) {
        return context.prisma.updateGroup({
          data: {
            name: args.input.name,
            address: {
              update: {
                country: args.input.address.country,
                province: args.input.address.province,
                city: args.input.address.city,
                street: args.input.address.street,
                apartmentUnit: args.input.address.apartmentUnit,
                postalCode: args.input.address.postalCode,
              },
            },
          },
          where: {
            id: args.input.groupId,
          },
        });
      }
      // else throw new error : user not in group
      throw new Error('User not in group');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  leaveGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // check if user is in group
      const exists = await context.prisma.$exists.userGroup({
        user: { firebaseId: res.uid },
        group: { id: args.input.groupId },
      });

      if (exists) {
        // get userGroup
        const userGroup = await getUserGroup(res.uid, args.input.groupId, context);
        // get id of userGroup (always returns an array because fetching by non-unique fields)
        const userGroupId = userGroup[0].id;

        const chatroom = await getUserChatroomById({
          input: {
            groupId: userGroupId,
            userId: res.uid,
          },
        }, context);

        await context.prisma.updateUserChatroom({
          data: {
            leftDate: new Date(),
          },
          where: {
            id: chatroom.id,
          },
        });

        return context.prisma.deleteUserGroup({ id: userGroupId });
      }
      throw new Error('User not in group', 'Could not leave group');
    } catch (error) {
      throw new Error(error);
    }
  },

  removeUsersFromGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // fetch group by id
      const group = await Query.group(root, args.input, context);
      // fetch admin
      const admin = await Group.admin(group, null, context);
      // check if current user is admin
      if (res.uid !== admin.firebaseId) {
        throw new Error('The current user is not the admin of the group.');
      }

      return Promise.all(
        args.input.userIdArray.map(async (element) => {
          // check if target is admin himself
          if (element === admin.uid) {
            throw new Error('The target user can\t be the admin of the group.');
          }
          // check if target user is in group
          if (!(await userBelongsToGroup(context, element, args.input.groupId))) {
            throw new Error('The target user is not a member of the group');
          }
          // fetch userGroup with ids
          const userGroup = await Query.userGroupByIds(root, {
            input: {
              userId: element,
              groupId: args.input.groupId,
            },
          }, context);

          await context.prisma.deleteUserGroup({ id: userGroup[0].id });
          return element;
        }),
      );
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // fetch group by id
      const group = await Query.group(root, args.input, context);

      // fetch admin
      const admin = await Group.admin(group, null, context);

      // check if user is admin of group
      if (admin.firebaseId === res.uid) {
        return context.prisma.deleteGroup({ id: group.id });
      }
      // throw error if not admin
      throw new Error('Only the admin can delete the group');
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { groupMutation };
