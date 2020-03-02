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

const inputValidation = (args, contributionsCount) => {
  if (args.input.isEven === false) {
    args.input.contributions.forEach((contribution) => {
      if (!contribution.percentage) {
        throw new Error('A percentage value is missing in the mutation\'s input.');
      }
    });
    if (!contributionPercentagesAddUpToHundred(args.input.contributions)) {
      throw new Error('Percentages doesn\'t add up to a hundred.');
    }
  }

  if (args.input.amount < contributionsCount) {
    throw new Error(`The total amount of the transaction is too small to be distributed among ${contributionsCount} people.`);
  }

  return true;
};

/*
// create a new transaction with a total amount splitted evenly between contributors
const createEvenTransaction = (context, transaction) => {
  const contributionAmounts = splitEvenly(transaction.amount, transaction.contributions);

  return context.prisma.createTransaction({
    paidBy: { connect: { firebaseId: transaction.paidBy.firebaseId } },
    amount: transaction.amount,
    isEven: transaction.isEven,
    description: transaction.description,
    group: { connect: { id: transaction.group.id } },
    contributions: {
      create: transaction.contributions.map((contribution) => ({
        user: { connect: { firebaseId: contribution.user.firebaseId } },
        percentage: percentOfTotalAmount(contributionAmounts[contribution.user.firebaseId], transaction.amount),
        amount: contributionAmounts[contribution.user.firebaseId].getAmount(),
      })),
    },
  });
};

// create a new transaction with a total amount distributed among contributors according to their contribution percentage
const createTransactionWithPercentage = (context, transaction) => {
  const contributionAmounts = splitWithPercentage(transaction.amount, transaction.contributions);

  return context.prisma.createTransaction({
    paidBy: { connect: { firebaseId: transaction.paidBy.firebaseId } },
    amount: transaction.amount,
    isEven: transaction.isEven,
    description: transaction.description,
    group: { connect: { id: transaction.group.id } },
    contributions: {
      create: transaction.contributions.map((contribution) => ({
        user: { connect: { firebaseId: contribution.user.firebaseId } },
        percentage: contribution.percentage,
        amount: contributionAmounts[contribution.user.firebaseId].getAmount(),
      })),
    },
  });
}; */

/*
// create and add a new contribution to an equally distributed existing transaction
const createEvenContribution = async (context, userId, contributionAmounts, amount, transactionId) => context.prisma.updateTransaction({
  where: {
    id: transactionId,
  },
  data: {
    contributions: {
      create: {
        user: { connect: { firebaseId: userId } },
        percentage: percentOfTotalAmount(contributionAmounts[userId], amount),
        amount: contributionAmounts[userId].getAmount(),
      },
    },
  },
});

// update a contribution of an equally distributed existing transaction
const updateEvenContribution = async (context, userId, contributionAmounts, amount, contributionId) => context.prisma.updateContribution({
  where: {
    id: contributionId,
  },
  data: {
    percentage: percentOfTotalAmount(contributionAmounts[userId], amount),
    amount: contributionAmounts[userId].getAmount(),
  },
}); */

/*
// update all the contributions of an equally distributed existing transaction
const updateEvenContributions = async (context, transaction, amount) => {
  const contributionAmounts = splitEvenly(amount, transaction.contributions);

  await transaction.contributions.forEach(async (contribution) => {
    const contributionId = await getContributionId(context, transaction.id, contribution.user.firebaseId);

    if (contributionId) {
      await updateEvenContribution(context, contribution.user.firebaseId, contributionAmounts, amount, contributionId);
    } else {
      await createEvenContribution(context, contribution.user.firebaseId, contributionAmounts, amount, transaction.id);
    }
  });
}; */

/*
// create and add a new contribution to an existing transaction distributed with percentages
const createContributionWithPercentage = async (context, contribution, contributionAmounts, transactionId) => context.prisma.updateTransaction({
  where: {
    id: transactionId,
  },
  data: {
    contributions: {
      create: {
        user: { connect: { firebaseId: contribution.user.firebaseId } },
        percentage: contribution.percentage,
        amount: contributionAmounts[contribution.user.firebaseId].getAmount(),
      },
    },
  },
});

// update a contribution of an existing transaction distributed with percentages
const updateContributionWithPercentage = async (context, contribution, contributionAmounts, contributionId) => context.prisma.updateContribution({
  where: {
    id: contributionId,
  },
  data: {
    percentage: contribution.percentage,
    amount: contributionAmounts[contribution.user.firebaseId].getAmount(),
  },
}); */

/*
// update all the contributions of an existing transaction distributed with percentages
const updateContributionsWithPercentage = async (context, transaction, amount) => {
  const contributionAmounts = splitWithPercentage(amount, transaction.contributions);

  await transaction.contributions.forEach(async (contribution) => {
    const contributionId = await getContributionId(context, transaction.id, contribution.user.firebaseId);

    if (contributionId) {
      await updateContributionWithPercentage(context, contribution, contributionAmounts, contributionId);
    } else {
      await createContributionWithPercentage(context, contribution, contributionAmounts, transaction.id);
    }
  });
}; */

/*
// delete contributions for users who are no longer involved in a transaction
const deleteOldContributions = async (args, context, transaction) => {
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

  return context.prisma.updateTransaction({
    where: {
      id: transaction.id,
    },
    data: {
      contributions: {
        delete: await Promise.all(contributionToDeleteUserIds.map(async (userId) => ({
          id: await getContributionId(context, transaction.id, userId),
        }))),
      },
    },
  });
}; */


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
  return contributions.filter((contribution) => contribution !== null);
};

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
  return contributions.filter((contribution) => contribution !== null);
};

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

const transactionMutation = {
  async createTransaction(root, args, context) {
    try {
      const res = await authenticate(context);

      if (inputValidation(args, args.input.contributions.length)) {
        const inputTransaction = {
          paidBy: {
            firebaseId: args.input.paidById,
          },
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

        // make sure that the connected user is allowed to create a new transaction for the specified group
        if (await userBelongsToGroup(context, res.uid, inputTransaction.group.id)) {
          // make an array of all specified firebaseIds without duplicates
          const userFirebaseIds = inputTransaction.contributions.map((contribution) => contribution.user.firebaseId);
          if (userFirebaseIds.indexOf(inputTransaction.paidBy.firebaseId) === -1) userFirebaseIds.push(inputTransaction.paidBy.firebaseId);

          // make sure that every specified users belongs to the same group
          if (await usersBelongsToGroup(context, userFirebaseIds, inputTransaction.group.id)) {
            const contributionAmountsDistribution = (inputTransaction.isEven
              ? splitEvenly(inputTransaction.amount, inputTransaction.contributions)
              : splitWithPercentage(inputTransaction.amount, inputTransaction.contributions));

            return context.prisma.createTransaction({
              paidBy: { connect: { firebaseId: inputTransaction.paidBy.firebaseId } },
              amount: inputTransaction.amount,
              isEven: inputTransaction.isEven,
              description: inputTransaction.description,
              group: { connect: { id: inputTransaction.group.id } },
              contributions: {
                create: inputTransaction.contributions.map((contribution) => ({
                  user: { connect: { firebaseId: contribution.user.firebaseId } },
                  percentage: inputTransaction.isEven
                    ? percentOfTotalAmount(contributionAmountsDistribution[contribution.user.firebaseId], inputTransaction.amount)
                    : contribution.percentage,
                  amount: contributionAmountsDistribution[contribution.user.firebaseId].getAmount(),
                })),
              },
            });
          }
          throw new Error('One or more specified users doesn\'t belong to the specified group.');
        } else {
          throw new Error('The connected user is not allowed to create a new transaction for the specified group.');
        }
      }
      throw new Error('An error occurred while creating a new transaction.');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async deleteTransaction(root, args, context) {
    try {
      const res = await authenticate(context);

      const group = await context.prisma.transaction({ id: args.input.transactionId }).group();

      // make sure that the connected user is allowed to create a new transaction for the specified group
      if (await userBelongsToGroup(context, res.uid, group.id)) {
        // with the onDelete: CASCADE in the datamodel.prisma, the contributions will be deleted as well
        return context.prisma.deleteTransaction({ id: args.input.transactionId });
      }
      throw new Error('The connected user is not allowed to delete this transaction.');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateTransaction(root, args, context) {
    try {
      const res = await authenticate(context);

      if (inputValidation(args, args.input.contributions.length)) {
        const inputTransaction = {
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

        /* const fragment = `
        fragment TransactionWithRelations on Transaction {
          id
          paidBy {
            firebaseId
          }
          isEven
          amount
          contributions {
            user {
              firebaseId
            }
            percentage
          }
        }
        `;

        const currentTransaction = await context.prisma.transaction({ id: inputTransaction.id }).$fragment(fragment); */

        // get the group associated to the transaction to update
        const group = await context.prisma.transaction({ id: inputTransaction.id }).group();

        // make sure that the connected user is allowed to create a new transaction for the specified group
        if (await userBelongsToGroup(context, res.uid, group.id)) {
          // make an array of all specified firebaseIds without duplicates
          const userFirebaseIds = inputTransaction.contributions.map((contribution) => contribution.user.firebaseId);
          if (userFirebaseIds.indexOf(inputTransaction.paidBy.firebaseId) === -1) userFirebaseIds.push(inputTransaction.paidBy.firebaseId);

          // make sure that every specified users belongs to the same group
          if (await usersBelongsToGroup(context, userFirebaseIds, group.id)) {
            const contributionAmountsDistribution = (inputTransaction.isEven
              ? splitEvenly(inputTransaction.amount, inputTransaction.contributions)
              : splitWithPercentage(inputTransaction.amount, inputTransaction.contributions));

            const contributionsToCreate = await getContributionsToCreate(context, inputTransaction, contributionAmountsDistribution);
            const contributionsToUpdate = await getContributionsToUpdate(context, inputTransaction, contributionAmountsDistribution);
            const contributionsToDelete = await getContributionsToDelete(context, inputTransaction);

            return context.prisma.updateTransaction({
              where: {
                id: inputTransaction.id,
              },
              data: {
                paidBy: { connect: { firebaseId: inputTransaction.paidBy.firebaseId } },
                isEven: inputTransaction.isEven,
                amount: inputTransaction.amount,
                description: inputTransaction.description,
                contributions: {
                  create: contributionsToCreate,
                  update: contributionsToUpdate,
                  delete: contributionsToDelete,
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

  /*
  async updateTransactionContributions(root, args, context) {
    try {
      const res = await authenticate(context);

      if (inputValidation(args, args.input.contributions.length)) {
        const inputTransaction = {
          id: args.input.transactionId,
          paidBy: {
            firebaseId: args.input.paidById,
          },
          isEven: args.input.isEven,
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
        const group = await context.prisma.transaction({ id: inputTransaction.id }).group();

        // make sure that the connected user is allowed to create a new transaction for the specified group
        if (await userBelongsToGroup(context, res.uid, group.id)) {
          // make an array of all specified firebaseIds without duplicates
          const userFirebaseIds = inputTransaction.contributions.map((contribution) => contribution.user.firebaseId);
          if (userFirebaseIds.indexOf(inputTransaction.paidBy.firebaseId) === -1) userFirebaseIds.push(inputTransaction.paidBy.firebaseId);

          // make sure that every specified users belongs to the same group
          if (await usersBelongsToGroup(context, userFirebaseIds, inputTransaction.group.id)) {

            const amount = await context.prisma.transaction({ id: inputTransaction.id }).amount();

            if (inputTransaction.isEven) {
              await updateEvenContributions(context, inputTransaction, amount);
            } else {
              await updateContributionsWithPercentage(context, inputTransaction, amount);
            }

            await deleteOldContributions(args, context, inputTransaction);

            // update isEven field for the concerned transaction
            return context.prisma.updateTransaction({
              where: {
                id: inputTransaction.id,
              },
              data: {
                isEven: inputTransaction.isEven,
              },
            });
          }
          throw new Error('One or more specified users doesn\'t belong to the specified group.');
        } else {
          throw new Error('The connected user is not allowed to create a new transaction for the specified group.');
        }
      }
      throw new Error('An error occurred while updating a transaction\'s contributions.');
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateTransactionAmount: async (root, args, context) => {
    const contributionsCount = await context.prisma.contributionsConnection({
      where: {
        transaction: {
          id: args.input.transactionId,
        },
      },
    }).aggregate().count();

    if (inputValidation(
      args,
      contributionsCount,
    )) {
      const inputTransaction = {
        id: args.input.transactionId,
        amount: args.input.amount,
      };

      const fragment = `
      fragment TransactionWithRelations on Transaction {
        id
        isEven
        contributions {
          user {
            firebaseId
          }
          percentage
        }
      }
      `;

      const currentTransaction = await context.prisma.transaction({ id: inputTransaction.id }).$fragment(fragment);

      if (currentTransaction.isEven) {
        await updateEvenContributions(context, currentTransaction, inputTransaction.amount);
      } else {
        await updateContributionsWithPercentage(context, currentTransaction, inputTransaction.amount);
      }

      // TODO - les contributions retournées ne sont pas à jours avec les nouvelles valeurs modifées
      //        (probablement à cause des foreach)
      // update amount field for the concerned transaction
      return context.prisma.updateTransaction({
        where: {
          id: inputTransaction.id,
        },
        data: {
          amount: inputTransaction.amount,
        },
      });
    }
    throw new Error('An error occurred while updating a transaction\'s total amount.');
  },

  updateTransactionDescription: (root, args, context) => context.prisma.updateTransaction({
    where: {
      id: args.input.transactionId,
    },
    data: {
      description: args.input.description,
    },
  }), */
};

module.exports = { transactionMutation };
