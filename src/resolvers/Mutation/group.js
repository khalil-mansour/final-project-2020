const { authenticate } = require('../../utils.js');
const { Query } = require('../Query/Query.js');
const { Group } = require('../Group');
const { invitationMutation } = require('../Mutation/invitation.js');

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
        },
      );

      // create initial landlord invitation for group
      await invitationMutation.createInvitation(
        root,
        {  
          input: {
            groupId: group.id,
            role: "landlord", 
          },
        }, 
        context);

      // create initial tenant invitation for group
      await invitationMutation.createInvitation(
        root,
        {  
          input: {
            groupId: group.id,
            role: "tenant", 
          },
        }, 
        context);      
      
      return group;

    } catch (error) {
      throw new Error(error.message);
    }
  },

  joinGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // check if group exists for code
      const exists = await context.prisma.invitation({ code: args.input.code }).group();

      if (exists) {
        // check if user already in group
        const userInGroup = await context.prisma.$exists.userGroup({
          user: { firebaseId: res.uid },
          group: { id: exists.id },
        });
        if (!userInGroup) {
          // fetch invitation by code
          const invitation = await context.prisma.invitation({ code: args.input.code });
          // fetch role
          const role = await context.prisma.invitation({ code: args.input.code }).role();
          // check if invitation code is valid (latest)
          const latest = await Query.lastInvitation(
            root,
            {
              groupId: exists.id,
              role: role.type,
            },
            context
          );
          
          if (invitation.id === latest[0].id) {
            return await context.prisma.createUserGroup({
              user: { connect: { firebaseId: res.uid } },
              group: { connect: { id: exists.id } },
              role: { connect: { type: role.type } },
            });          
          }
          else {
            throw new Error("This invitation code is no longer valid !");
          }          
        }
        throw new Error("User already in group !");
      }
      throw new Error("Group doesn't exist or invalid code !");
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
