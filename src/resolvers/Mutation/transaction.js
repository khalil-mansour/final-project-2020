const Dinero = require('dinero.js');
const { authenticate, userBelongsToGroup, usersBelongsToGroup } = require('../../utils.js');

// returns a dictionary indicating the correspondence between a user and the amount of his contribution
const getSplitDistribution = (splitedDineroAmounts, contributions) => {
  const distribution = {};
  for (let index = 0; index < contributions.length; index++) {
    distribution[contributions[index].user.firebaseId] = splitedDineroAmounts[index];
  }

  return distribution;
};

// split the total amount in even amounts
// contributors is an array of ID's (ex: ["id#1", "id#2", "..."])
const splitEvenly = (amount, contributions) => {
  const splitedDineroAmounts = Dinero({ amount }).allocate(Array(contributions.length).fill(1));
  return getSplitDistribution(splitedDineroAmounts, contributions);
};

// split the total amount in amounts determined by the percentages contained in the contributions array
// contriutions is an array of contribution structure (ex: [{user: "userID", amount: null, percentage: <0-100>}])
const splitWithPercentage = (amount, contributions) => {
  const splitedDineroAmounts = Dinero({ amount }).allocate(contributions.map((contribution) => contribution.percentage));
  return getSplitDistribution(splitedDineroAmounts, contributions);
};

// get the percentage of the amount compared to the total amount
const percentOfTotalAmount = (amount, totalAmount) => (amount.getAmount() * 100) / totalAmount;

// verify if the total of all the percentages add up to a hundred
const contributionPercentagesAddUpToHundred = (contributions) => contributions.map((contribution) => contribution.percentage).reduce((total, percentage) => total + percentage) === 100;

// get the id of the contribution related to a user and a transaction if it exists
const getContributionId = async (context, transactionId, userId) => {
  const existingContributions = await context.prisma.contributions({
    where: {
      transaction: {
        id: transactionId,
      },
      user: {
        firebaseId: userId,
      },
    },
  });

  let contributionId;

  if (existingContributions.length > 1) {
    throw new Error('The result of the query is inconsistent. A user should only contribute one time to a transaction.');
  } else if (existingContributions.length === 1) {
    contributionId = existingContributions[0].id;
  }

  return contributionId;
};

// validate that no field is missing in the input
const transactionInputValidation = (inputTransaction) => {
  if (inputTransaction.isEven === false) {
    inputTransaction.contributions.forEach((contribution) => {
      if (!contribution.percentage) {
        throw new Error('A percentage value is missing in the mutation\'s input.');
      }
    });
    if (!contributionPercentagesAddUpToHundred(inputTransaction.contributions)) {
      throw new Error('Percentages doesn\'t add up to a hundred.');
    }
  }

  const contributionsCount = inputTransaction.contributions.length;
  if (inputTransaction.amount < contributionsCount) {
    throw new Error(`The total amount of the transaction is too small to be distributed among ${contributionsCount} people.`);
  }

  return true;
};

// Get the array of contributions to create. This array should be put in a nested prisma create.
const getContributionsToCreate = async (context, transaction, contributionAmountsDistribution) => {
  // whit the map, the code can be executed in parallel
  const contributions = await Promise.all(transaction.contributions.map(
    async (contribution) => {
      const contributionId = await getContributionId(context, transaction.id, contribution.user.firebaseId);

      if (!contributionId) {
        return {
          user: { connect: { firebaseId: contribution.user.firebaseId } },
          percentage: (transaction.isEven
            ? percentOfTotalAmount(contributionAmountsDistribution[contribution.user.firebaseId], transaction.amount)
            : contribution.percentage),
          amount: contributionAmountsDistribution[contribution.user.firebaseId].getAmount(),
        };
      }
      return null;
    },
  ));
  // keep only the valid elements
  return contributions.filter((contribution) => contribution !== null);
};

// Get the array of contributions to update. This array should be put in a nested prisma update.
const getContributionsToUpdate = async (context, transaction, contributionAmountsDistribution) => {
  // whit the map, the code can be executed in parallel
  const contributions = await Promise.all(transaction.contributions.map(
    async (contribution) => {
      const contributionId = await getContributionId(context, transaction.id, contribution.user.firebaseId);

      if (contributionId) {
        return {
          where: {
            id: contributionId,
          },
          data: {
            percentage: (transaction.isEven
              ? percentOfTotalAmount(contributionAmountsDistribution[contribution.user.firebaseId], transaction.amount)
              : contribution.percentage),
            amount: contributionAmountsDistribution[contribution.user.firebaseId].getAmount(),
          },
        };
      }
      return null;
    },
  ));
  // keep only the valid elements
  return contributions.filter((contribution) => contribution !== null);
};

// Get the array of contributions to delete. This array should be put in a nested prisma delete.
const getContributionsToDelete = async (context, transaction) => {
  const fragment = `
  fragment ContributionWithUserId on Contribution {
    user {
      firebaseId
    }
  }
  `;
  const oldContributions = await context.prisma.transaction({ id: transaction.id }).contributions().$fragment(fragment);
  const oldContributionUserIds = oldContributions.map((contribution) => contribution.user.firebaseId);
  const newContributionUserIds = transaction.contributions.map((contribution) => contribution.user.firebaseId);
  const contributionToDeleteUserIds = oldContributionUserIds.filter((userId) => !newContributionUserIds.includes(userId));

  return Promise.all(contributionToDeleteUserIds.map(async (userId) => ({
    id: await getContributionId(context, transaction.id, userId),
  })));
};

// get a list of the firebaseIds of all the concerned users for an entry in the transaction operations historic
// return a list of object (ex: [{ firebaseId: "abcd" }, { firebaseId: "efgh" }, ...])
const getHistoricConcernedUsers = (connectedUserId, paidByUserId, contributions) => {
  const historicConcernedUsers = contributions.map((contribution) => ({
    firebaseId: contribution.user.firebaseId,
  }));

  if (historicConcernedUsers.indexOf({ firebaseId: connectedUserId }) === -1) {
    historicConcernedUsers.push({ firebaseId: connectedUserId });
  }
  if (historicConcernedUsers.indexOf({ firebaseId: paidByUserId }) === -1) {
    historicConcernedUsers.push({ firebaseId: paidByUserId });
  }

  return historicConcernedUsers;
};

// create a new transaction and its contributions
const createTransactionFunction = async (context, connectedUserId, parsedInputTransaction) => {
  // make sure that the connected user is allowed to create a new transaction for the specified group
  if (await userBelongsToGroup(context, connectedUserId, parsedInputTransaction.group.id)) {
    // make an array of all specified firebaseIds without duplicates
    const userFirebaseIds = parsedInputTransaction.contributions.map((contribution) => contribution.user.firebaseId);
    if (userFirebaseIds.indexOf(parsedInputTransaction.paidBy.firebaseId) === -1) {
      userFirebaseIds.push(parsedInputTransaction.paidBy.firebaseId);
    }

    // make sure that every specified users belongs to the same group
    if (await usersBelongsToGroup(context, userFirebaseIds, parsedInputTransaction.group.id)) {
      const contributionAmountsDistribution = (parsedInputTransaction.isEven
        ? splitEvenly(parsedInputTransaction.amount, parsedInputTransaction.contributions)
        : splitWithPercentage(parsedInputTransaction.amount, parsedInputTransaction.contributions));

      return context.prisma.createTransaction({
        paidBy: { connect: { firebaseId: parsedInputTransaction.paidBy.firebaseId } },
        amount: parsedInputTransaction.amount,
        isPayback: parsedInputTransaction.isPayback,
        isEven: parsedInputTransaction.isEven,
        description: parsedInputTransaction.description,
        group: { connect: { id: parsedInputTransaction.group.id } },
        contributions: {
          create: parsedInputTransaction.contributions.map((contribution) => ({
            user: { connect: { firebaseId: contribution.user.firebaseId } },
            percentage: parsedInputTransaction.isEven
              ? percentOfTotalAmount(contributionAmountsDistribution[contribution.user.firebaseId], parsedInputTransaction.amount)
              : contribution.percentage,
            amount: contributionAmountsDistribution[contribution.user.firebaseId].getAmount(),
          })),
        },
        operationsHistoric: {
          create: {
            type: { connect: { name: 'CREATE' } },
            transactionDescription: parsedInputTransaction.description,
            operationMadeByUser: { connect: { firebaseId: connectedUserId } },
            concernedUsers: {
              connect: getHistoricConcernedUsers(
                connectedUserId,
                parsedInputTransaction.paidBy.firebaseId,
                parsedInputTransaction.contributions,
              ),
            },
          },
        },
      });
    }
    throw new Error('One or more specified users doesn\'t belong to the specified group.');
  } else {
    throw new Error('The connected user is not allowed to create a new transaction for the specified group.');
  }
};

const transactionMutation = {
  // create a new transaction and its contributions
  async createTransaction(root, args, context) {
    try {
      const res = await authenticate(context);
      if (transactionInputValidation(args.input)) {
        const parsedInputTransaction = {
          paidBy: {
            firebaseId: args.input.paidById,
          },
          isPayback: false,
          isEven: args.input.isEven,
          amount: args.input.amount,
          description: args.input.description,
          group: {
            id: args.input.groupId,
          },
          contributions: args.input.contributions.map((contribution) => (
            {
              user: {
                firebaseId: contribution.userId,
              },
              percentage: contribution.percentage,
            }
          )),
        };
        return createTransactionFunction(context, res.uid, parsedInputTransaction);
      }
      throw new Error('An error occurred while creating a new transaction.');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // delete a transaction and its contributions
  async deleteTransaction(root, args, context) {
    try {
      const res = await authenticate(context);

      const fragment = `
      fragment TransactionWithGroupPaidByContributions on Transaction {
        group {
          id
        }
        paidBy {
          firebaseId
        }
        contributions {
          user {
            firebaseId
          }
        }
      }
      `;
      const transactionToDelete = await context.prisma.transaction({ id: args.input.transactionId }).$fragment(fragment);

      // make sure that the connected user is allowed to delete a transaction for the specified group
      if (await userBelongsToGroup(context, res.uid, transactionToDelete.group.id)) {
        // with the onDelete: CASCADE in the datamodel.prisma, the contributions will be deleted as well
        const deletedTransaction = await context.prisma.deleteTransaction({ id: args.input.transactionId });

        await context.prisma.createTransactionOperationHistoric({
          type: { connect: { name: 'DELETE' } },
          transactionDescription: deletedTransaction.description,
          operationMadeByUser: { connect: { firebaseId: res.uid } },
          concernedUsers: {
            connect: getHistoricConcernedUsers(
              res.uid,
              transactionToDelete.paidBy.firebaseId,
              transactionToDelete.contributions,
            ),
          },
        });

        return deletedTransaction;
      }
      throw new Error('The connected user is not allowed to delete this transaction.');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // update a transaction and its contributions entirely
  async updateTransaction(root, args, context) {
    try {
      const res = await authenticate(context);

      if (transactionInputValidation(args.input)) {
        const parsedInputTransaction = {
          id: args.input.transactionId,
          paidBy: {
            firebaseId: args.input.paidById,
          },
          isEven: args.input.isEven,
          amount: args.input.amount,
          description: args.input.description,
          contributions: args.input.contributions.map((contribution) => (
            {
              user: {
                firebaseId: contribution.userId,
              },
              percentage: contribution.percentage,
            }
          )),
        };

        // get the group associated to the transaction to update
        const group = await context.prisma.transaction({ id: parsedInputTransaction.id }).group();

        // make sure that the connected user is allowed to update a transaction for the specified group
        if (await userBelongsToGroup(context, res.uid, group.id)) {
          // make an array of all specified firebaseIds without duplicates
          const userFirebaseIds = parsedInputTransaction.contributions.map((contribution) => contribution.user.firebaseId);
          if (userFirebaseIds.indexOf(parsedInputTransaction.paidBy.firebaseId) === -1) {
            userFirebaseIds.push(parsedInputTransaction.paidBy.firebaseId);
          }

          // make sure that every specified users belongs to the same group
          if (await usersBelongsToGroup(context, userFirebaseIds, group.id)) {
            const contributionAmountsDistribution = (parsedInputTransaction.isEven
              ? splitEvenly(parsedInputTransaction.amount, parsedInputTransaction.contributions)
              : splitWithPercentage(parsedInputTransaction.amount, parsedInputTransaction.contributions));

            const contributionsToCreate = await getContributionsToCreate(context, parsedInputTransaction, contributionAmountsDistribution);
            const contributionsToUpdate = await getContributionsToUpdate(context, parsedInputTransaction, contributionAmountsDistribution);
            const contributionsToDelete = await getContributionsToDelete(context, parsedInputTransaction);

            return context.prisma.updateTransaction({
              where: {
                id: parsedInputTransaction.id,
              },
              data: {
                paidBy: { connect: { firebaseId: parsedInputTransaction.paidBy.firebaseId } },
                isEven: parsedInputTransaction.isEven,
                amount: parsedInputTransaction.amount,
                description: parsedInputTransaction.description,
                contributions: {
                  create: contributionsToCreate,
                  update: contributionsToUpdate,
                  delete: contributionsToDelete,
                },
                operationsHistoric: {
                  create: {
                    type: { connect: { name: 'UPDATE' } },
                    transactionDescription: parsedInputTransaction.description,
                    operationMadeByUser: { connect: { firebaseId: res.uid } },
                    concernedUsers: {
                      connect: getHistoricConcernedUsers(
                        res.uid,
                        parsedInputTransaction.paidBy.firebaseId,
                        parsedInputTransaction.contributions,
                      ),
                    },
                  },
                },
              },
            });
          }
          throw new Error('One or more specified users doesn\'t belong to the group related to the transaction.');
        } else {
          throw new Error('The connected user is not allowed to update the specified transaction.');
        }
      }
      throw new Error('An error occurred while updating the specified transaction.');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // update a transaction's description
  async updateTransactionDescription(root, args, context) {
    try {
      const res = await authenticate(context);

      const group = await context.prisma.transaction({ id: args.input.transactionId }).group();

      // make sure that the connected user is allowed to update a transaction for the specified group
      if (await userBelongsToGroup(context, res.uid, group.id)) {
        const fragment = `
        fragment ContributionWithUserId on Contribution {
          user {
            firebaseId
          }
        }
        `;
        const contributions = await context.prisma.transaction({ id: args.input.transactionId }).contributions().$fragment(fragment);
        const paidBy = await context.prisma.transaction({ id: args.input.transactionId }).paidBy();

        return context.prisma.updateTransaction({
          where: {
            id: args.input.transactionId,
          },
          data: {
            description: args.input.description,
            operationsHistoric: {
              create: {
                type: { connect: { name: 'UPDATE' } },
                transactionDescription: args.input.description,
                operationMadeByUser: { connect: { firebaseId: res.uid } },
                concernedUsers: {
                  connect: getHistoricConcernedUsers(
                    res.uid,
                    paidBy.firebaseId,
                    contributions,
                  ),
                },
              },
            },
          },
        });
      }
      throw new Error('The connected user is not allowed to update this transaction.');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // pay back another user
  async payBack(root, args, context) {
    try {
      const res = await authenticate(context);

      const parsedInputTransaction = {
        paidBy: {
          firebaseId: res.uid,
        },
        isPayback: true,
        isEven: true,
        amount: args.input.amount,
        description: 'Pay back',
        group: {
          id: args.input.groupId,
        },
        contributions: [{
          user: {
            firebaseId: args.input.payBackToUserId,
          },
          percentage: 100,
        }],
      };
      return createTransactionFunction(context, res.uid, parsedInputTransaction);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { transactionMutation };
