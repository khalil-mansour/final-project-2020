const { authenticate, userBelongsToGroup } = require('../../utils.js');

const getFirebaseIdsFromAllUsersInGroup = async (context, groupId) => {
  const fragmentUserGroup = `
  fragment UserGroupWithUserFirebaseId on UserGroup {
    user {
      firebaseId
    }
  }
  `;
  const groupUsers = await context.prisma.userGroups({
    where: {
      group: {
        id: groupId,
      },
    },
  }).$fragment(fragmentUserGroup);

  return groupUsers.map((groupUser) => groupUser.user.firebaseId);
};

/* get the balances of the connected user with every person of a group
    positive balance: the person owe you
    negative balance: you owe this person */
const getAllUserBalances = async (context, groupId, connectedUserId) => {
  const fragmentContribution = `
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
            isDeleted: false,
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
  }).$fragment(fragmentContribution);

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

  const userIds = Object.keys(userBalances);
  const allUserIdsOfGroup = await getFirebaseIdsFromAllUsersInGroup(context, groupId);
  const missingUserIds = allUserIdsOfGroup.filter((id) => !userIds.includes(id) && id !== connectedUserId);

  // add the users of the group who have never been involved in a transaction linked to the connected user
  // (exept the connected user)
  missingUserIds.forEach((userId) => {
    userBalances[userId] = 0;
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

const getTransactionBalanceAmount = (transaction, userId) => {
  if (transaction.paidBy.firebaseId === userId) {
    const filteredContributions = transaction.contributions
      .filter((contribution) => contribution.user.firebaseId !== userId);

    if (filteredContributions.length > 0) {
      return filteredContributions
        .map((contribution) => contribution.amount)
        .reduce((total, balance) => total + balance);
    }
    return 0;
  }
  return transaction.contributions
    .find((contribution) => contribution.user.firebaseId === userId).amount * -1;
};

const transactionQuery = {
  /* GET single transaction by ID */
  transaction: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      const group = await context.prisma.transaction({ id: args.transactionId }).group();

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, group.id))) {
        throw new Error('The connected user is not allowed to query this transaction.');
      }

      const fragment = `
      fragment TransactionWithContributionsAndUsers on Transaction {
        id
        amount
        description
        isPayback
        createdBy {
          firebaseId
          name
          lastName
        }
        paidBy {
          firebaseId
          name
          lastName
        }
        contributions {
          user {
            firebaseId
            name
            lastName
          }
          amount
        }
        createdAt
        updatedAt
      }
      `;

      return context.prisma.transaction({ id: args.transactionId }).$fragment(fragment);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET all transactions paid by a user for a group */
  userPaidTransactionsForGroup: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }

      const fragment = `
      fragment TransactionWithContributionsAndUsers on Transaction {
        id
        amount
        description
        isPayback
        paidBy {
          firebaseId
        }
        contributions {
          user {
            firebaseId
          }
          amount
        }
        updatedAt
      }
      `;

      const transactions = await context.prisma.transactions({
        orderBy: 'createdAt_DESC',
        where: {
          group: { id: args.groupId },
          paidBy: { firebaseId: res.uid },
          isDeleted: false,
        },
      }).$fragment(fragment);

      return transactions.map((transaction) => ({
        transactionBalanceAmount: getTransactionBalanceAmount(transaction, res.uid),
        transaction,
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET all transactions related to a user of a group */
  groupTransactionsForUser: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }

      const fragment = `
      fragment TransactionWithContributionsAndUsers on Transaction {
        id
        amount
        description
        isPayback
        paidBy {
          firebaseId
        }
        contributions {
          user {
            firebaseId
          }
          amount
        }
        updatedAt
      }
      `;

      const transactions = await context.prisma.transactions({
        orderBy: 'createdAt_DESC',
        where: {
          AND: [
            {
              group: {
                id: args.groupId,
              },
              isDeleted: false,
            },
            {
              OR: [
                {
                  contributions_some: {
                    user: {
                      firebaseId: res.uid,
                    },
                  },
                },
                {
                  paidBy: {
                    firebaseId: res.uid,
                  },
                },
                {
                  createdBy: {
                    firebaseId: res.uid,
                  },
                },
              ],
            },
          ],
        },
      }).$fragment(fragment);

      return transactions.map((transaction) => ({
        transactionBalanceAmount: getTransactionBalanceAmount(transaction, res.uid),
        transaction,
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET all contributions related to a user of a group */
  groupContributionsForUser: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }

      return context.prisma.contributions({
        orderBy: 'createdAt_DESC',
        where: {
          AND: [
            {
              transaction: {
                group: {
                  id: args.groupId,
                },
                isDeleted: false,
              },
            },
            {
              OR: [
                {
                  user: {
                    firebaseId: res.uid,
                  },
                },
                {
                  transaction: {
                    paidBy: {
                      firebaseId: res.uid,
                    },
                  },
                },
              ],
            },
            {
              NOT: [
                {
                  AND: [
                    {
                      user: {
                        firebaseId: res.uid,
                      },
                    },
                    {
                      transaction: {
                        paidBy: {
                          firebaseId: res.uid,
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET all transactions related to the connected user and another user of a group */
  groupTransactionsForTwoUsers: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.input.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }
      if (!(await userBelongsToGroup(context, args.input.otherUserId, args.input.groupId))) {
        throw new Error('The specified user is not a member of this group.');
      }

      const fragment = `
      fragment TransactionWithContributionsAndUsers on Transaction {
        id
        amount
        description
        isPayback
        paidBy {
          firebaseId
        }
        contributions {
          user {
            firebaseId
          }
          amount
        }
        updatedAt
      }
      `;

      const transactions = await context.prisma.transactions({
        orderBy: 'createdAt_DESC',
        where: {
          AND: [
            {
              group: {
                id: args.input.groupId,
              },
              isDeleted: false,
            },
            {
              OR: [
                {
                  AND: [
                    {
                      contributions_some: {
                        user: {
                          firebaseId: res.uid,
                        },
                      },
                    },
                    {
                      paidBy: {
                        firebaseId: args.input.otherUserId,
                      },
                    },
                  ],
                },
                {
                  AND: [
                    {
                      contributions_some: {
                        user: {
                          firebaseId: args.input.otherUserId,
                        },
                      },
                    },
                    {
                      paidBy: {
                        firebaseId: res.uid,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      }).$fragment(fragment);

      return transactions.map((transaction) => ({
        transactionBalanceAmount: getTransactionBalanceAmount(transaction, res.uid),
        transaction,
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET all the operations made on every transactions related to a user at the moment of these operations for a group */
  groupTransactionsOperationsHistoric: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }

      const fragment = `
      fragment TransactionOperationHistoricWithRelations on TransactionOperationHistoric {
        id
        type {
          name
        }
        transaction {
          id
          isPayback
          contributions {
            id
            user {
              id
              firebaseId
              name
              lastName
            }
          }
        }
        transactionDescription
        operationMadeByUser {
          id
          firebaseId
          name
          lastName
        }
        createdAt
      }
      `;

      return context.prisma.transactionOperationHistorics({
        orderBy: 'createdAt_DESC',
        where: {
          concernedUsers_some: {
            firebaseId: res.uid,
          },
          transaction: {
            group: {
              id: args.groupId,
            },
          },
        },
      }).$fragment(fragment);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET the balances with every person of a group */
  allBalances: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }

      return getAllUserBalances(context, args.groupId, res.uid);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /* GET the balances with every person of a group with unpaid amounts */
  unpaidBalances: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }

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

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }

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

      // make sure that the connected user is allowed to make query for the specified group
      if (!(await userBelongsToGroup(context, res.uid, args.groupId))) {
        throw new Error('The connected user is not allowed to make query for this group.');
      }

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

module.exports = { transactionQuery };
