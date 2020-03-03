const { authenticate } = require('../utils.js');

/* get the balances of the connected user with every person of a group
    positive balance: the person owe you
    negative balance: you owe this person */
const getAllUserBalances = async (context, groupId, connectedUserId) => {
  const fragment = `
  fragment ContributionWithUserAndTransaction on Contribution {
    user {
      firebaseId
    }
    transaction {
      paidBy {
        firebaseId
      }
    }
    amount
  }
  `;

  const concernedContributions = await context.prisma.contributions({
    where: {
      AND: [
        {
          transaction: {
            group: {
              id: groupId,
            },
          },
        },
        {
          OR: [
            {
              user: {
                firebaseId: connectedUserId,
              },
            },
            {
              transaction: {
                paidBy: {
                  firebaseId: connectedUserId,
                },
              },
            },
          ],
        },
      ],
    },
  }).$fragment(fragment);

  let totalBalance = 0;
  const userBalances = {};

  concernedContributions.forEach((contribution) => {
    const paidById = contribution.transaction.paidBy.firebaseId;
    const contributorId = contribution.user.firebaseId;
    // you owe money to someone or someone paid you back
    if (paidById !== connectedUserId) {
      totalBalance -= contribution.amount;
      userBalances[paidById] = (paidById in userBalances)
        ? userBalances[paidById] - contribution.amount
        : contribution.amount * -1;
    } else if (contributorId !== connectedUserId) {
      totalBalance += contribution.amount;
      userBalances[contributorId] = (contributorId in userBalances)
        ? userBalances[contributorId] + contribution.amount
        : contribution.amount;
    }
  });
  // Object.entries convert an object to an array
  return {
    totalBalance,
    userBalances: await Promise.all(Object.entries(userBalances).map(async ([userId, balance]) => (
      {
        user: await context.prisma.user({ firebaseId: userId }),
        balance,
      }
    ))),
  };
};

const Query = {

  /* verify if the user exist in the database */
  login: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      return context.prisma.$exists.user({ firebaseId: res.uid });
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  /* GET user by ID */
  user: (root, args, context) => context.prisma.user({ id: args.userId }),
  /* GET user by firebase ID */
  users: (root, args, context) => context.prisma.users(),
  /* GET user by firebase ID */
  userByFirebase: (root, firebaseId, context) => context.prisma.user({ firebaseId }),

  /* GET all groups */
  groups: (parent, args, context) => context.prisma.groups(),
  /* GET group by id */
  group: (root, args, context) => context.prisma.group({ id: args.groupId }),

  /* GET all addresses */
  addresses: (root, args, context) => context.prisma.addresses(),
  /* GET single address by ID */
  address: (root, args, context) => context.prisma.address({ id: args.addressId }),

  /* GET all invitations */
  invitations: (root, args, context) => context.prisma.invitations(),
  /* GET single invitation by ID */
  invitation: (root, args, context) => context.prisma.invitation({ id: args.invitationId }),

  /* Get all userGroups */
  userGroups: (root, args, context) => context.prisma.userGroups(),
  /* Get userGroup by ID */
  userGroup: (root, args, context) => context.prisma.userGroup({ id: args.userGroupId }),
  /* Get userGroup by user and group IDs */
  userGroupByIds: (root, args, context) => context.prisma.userGroups({
    where: {
      user: { id: args.input.userId },
      group: { id: args.input.groupId },
    },
  }),

  /* GET all transactions */
  transactions: (root, args, context) => context.prisma.transactions(),
  /* GET single transaction by ID */
  transaction: (root, args, context) => context.prisma.transaction({ id: args.id }),

  /* GET all transactions paid by a user */
  userTransactions: (root, args, context) => context.prisma.transactions({ paidBy: { id: args.id } }),

  /* GET all transactions of a group */
  groupTransactions: (root, args, context) => context.prisma.transactions({ group: { id: args.id } }),

  /* GET all contributions */
  contributions: (root, args, context) => context.prisma.contributions(),
  /* GET single contribution by ID */
  contribution: (root, args, context) => context.prisma.contribution({ id: args.id }),

  /* GET the balances with every person of a group */
  allBalances: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      return getAllUserBalances(context, args.groupId, res.uid);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET the balances with every person of a group with unpaid amounts */
  unpaidBalances: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      const userBalances = await getAllUserBalances(context, args.groupId, res.uid);
      const filteredUserBalances = userBalances.userBalances.filter((userBalance) => userBalance.balance !== 0);
      return {
        totalBalance: userBalances.totalBalance,
        userBalances: filteredUserBalances,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET the balances whit every person of a group that owe you money */
  usersWhoOweYou: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      const allUserBalances = await getAllUserBalances(context, args.groupId, res.uid);
      const filteredUserBalances = allUserBalances.userBalances.filter((userBalance) => userBalance.balance > 0);
      const filteredTotalBalance = filteredUserBalances.length > 0
        ? filteredUserBalances
          .map((filteredUserBalance) => filteredUserBalance.balance)
          .reduce((total, balance) => total + balance)
        : 0;
      return {
        totalBalance: filteredTotalBalance,
        userBalances: filteredUserBalances,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET the balances whit every person of a group that you owe money to */
  usersYouOweTo: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      const allUserBalances = await getAllUserBalances(context, args.groupId, res.uid);
      const filteredUserBalances = allUserBalances.userBalances.filter((userBalance) => userBalance.balance < 0);
      const filteredTotalBalance = filteredUserBalances.length > 0
        ? filteredUserBalances
          .map((filteredUserBalance) => filteredUserBalance.balance)
          .reduce((total, balance) => total + balance)
        : 0;
      return {
        totalBalance: filteredTotalBalance,
        userBalances: filteredUserBalances,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { Query };
