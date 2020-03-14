const { authenticate } = require('../../utils.js');
const { Query } = require('../Query/Query.js');
const { Group } = require('../Group');

async function getUserGroup(user, group, context) {
  const userGroup = await context.prisma.userGroups({
    where: {
      user: { id: user },
      group: { id: group },
    },
  });
  return userGroup;
}

const groupMutation = {
  createGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      return await context.prisma.createUserGroup(
        {
          user: { connect: { firebaseId: res.uid } },
          group: {
            create: {
              name: args.input.name,
              admin: { connect: { firebaseId: res.uid } },
              address: {
                create: {
                  country: args.input.address.country,
                  province: args.input.address.province,
                  city: args.input.address.city,
                  street: args.input.address.street,
                  apartmentUnit: args.input.address.apartmentUnit,
                  postalCode: args.input.address.postalCode,
                },
              },
            },
          },
          joinAt: new Date().toUTCString(),
        },
      );
    } catch (error) {
      throw new Error(error.message);
    }
  },

  joinGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // fetch user by uid
      const user = await Query.userByFirebase(root, { firebaseId: res.uid }, context);

      const exists = await context.prisma.$exists.group({
        id: args.input.groupId,
      });

      if (exists) {
        const userInGroup = await context.prisma.$exists.userGroup({
          user: { id: user.id },
          group: { id: args.input.groupId },
        });
        if (!userInGroup) {
          await context.prisma.createUserGroup({
            user: { connect: { id: user.id } },
            group: { connect: { id: args.input.groupId } },
            joinAt: new Date().toUTCString(),
          });
        }

        return await Query.group(root, args.input, context);
      }

      throw new Error("Group doesn't exist!");
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateGroupName: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // fetch user by uid
      const user = await Query.userByFirebase(root, { firebaseId: res.uid }, context);
      // check if user is in group
      const exists = await context.prisma.$exists.userGroup({
        user: { id: user.id },
        group: { id: args.input.groupId },
      });
      // if user in group, update group
      if (exists) {
        return await context.prisma.updateGroup({
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
      // fetch user by uid
      const user = await Query.userByFirebase(root, { firebaseId: res.uid }, context);
      // check if user is in group
      const exists = await context.prisma.$exists.userGroup({
        user: { id: user.id },
        group: { id: args.input.groupId },
      });

      if (exists) {
        // get userGroup
        const userGroup = await getUserGroup(user.id, args.input.groupId, context);
        // get id of userGroup (always returns an array because fetching by non-unique fields)
        const userGroupId = userGroup[0].id;
        const deletedUserGroup = await context.prisma.deleteUserGroup({ id: userGroupId });
        return deletedUserGroup;
      }
      throw new Error('User not in group', 'Could not leave group');
    } catch (error) {
      throw new Error(error);
    }
  },

  removeUserFromGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // fetch current user by uid
      const user = await Query.userByFirebase(root, { firebaseId: res.uid }, context);
      // fetch target user by uid
      const targetUser = await Query.userByFirebase(
        root,
        {
          firebaseId: args.input.userId,
        },
        context,
      );
      // fetch group by id
      const group = await Query.group(root, args.input, context);
      // fetch admin
      const admin = await Group.admin(group, null, context);
      // check if current user is admin
      if (user.id === admin.id) {
        // check if target user is in group
        const exists = await context.prisma.$exists.userGroup({
          user: { id: targetUser.id },
          group: { id: args.input.groupId },
        });

        if (exists) {
          const userGroup = await Query.userGroupByIds(root, {
            input: {
              userId: targetUser.id,
              groupId: args.input.groupId,
            },
          }, context);
          // get id of userGroup
          const userGroupId = userGroup[0].id;
          // delete userGroup
          await context.prisma.deleteUserGroup({ id: userGroupId });
          return group;
        }
        throw new Error('The target user is not a member of the group');
      }
      throw new Error('The current user is not the admin of the group.');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // fetch user by uid
      const user = await Query.userByFirebase(root, res.uid, context);
      // fetch group by id
      const group = await Query.group(root, args.input, context);
      // fetch admin
      const admin = await Group.admin(group, null, context);
      // check if user is admin of group
      if (admin.id === user.id) {
        return await context.prisma.deleteGroup({ id: group.id });
      }
      // throw error if not admin
      throw new Error('Only the admin can delete the group');
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { groupMutation };
