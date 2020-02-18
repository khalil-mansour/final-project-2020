const Dinero = require('dinero.js');

// returns a dictionary indicating the correspondence between a user and the amount of his contribution
const getSplitDistribution = (splitedDineroAmounts, contributions) => {
  const distribution = {};
  for (let index = 0; index < contributions.length; index++) {
    distribution[contributions[index].user.id] = splitedDineroAmounts[index];
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
        id: userId,
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

// create a new transaction with a total amount splitted evenly between contributors
const createEvenTransaction = (context, transaction) => {
  const contributionAmounts = splitEvenly(transaction.amount, transaction.contributions);

  return context.prisma.createTransaction({
    paidBy: { connect: { id: transaction.paidBy.id } },
    amount: transaction.amount,
    isEven: transaction.isEven,
    description: transaction.description,
    group: { connect: { id: transaction.group.id } },
    contributions: {
      create: transaction.contributions.map((contribution) => ({
        user: { connect: { id: contribution.user.id } },
        percentage: percentOfTotalAmount(contributionAmounts[contribution.user.id], transaction.amount),
        amount: contributionAmounts[contribution.user.id].getAmount(),
      })),
    },
  });
};

// create a new transaction with a total amount distributed among contributors according to their contribution percentage
const createTransactionWithPercentage = (context, transaction) => {
  const contributionAmounts = splitWithPercentage(transaction.amount, transaction.contributions);

  return context.prisma.createTransaction({
    paidBy: { connect: { id: transaction.paidBy.id } },
    amount: transaction.amount,
    isEven: transaction.isEven,
    description: transaction.description,
    group: { connect: { id: transaction.group.id } },
    contributions: {
      create: transaction.contributions.map((contribution) => ({
        user: { connect: { id: contribution.user.id } },
        percentage: contribution.percentage,
        amount: contributionAmounts[contribution.user.id].getAmount(),
      })),
    },
  });
};

// create and add a new contribution to an equally distributed existing transaction
const createEvenContribution = async (context, userId, contributionAmounts, amount, transactionId) => context.prisma.updateTransaction({
  where: {
    id: transactionId,
  },
  data: {
    contributions: {
      create: {
        user: { connect: { id: userId } },
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
});

// update all the contributions of an equally distributed existing transaction
const updateEvenContributions = async (context, transaction, amount) => {
  const contributionAmounts = splitEvenly(amount, transaction.contributions);

  await transaction.contributions.forEach(async (contribution) => {
    const contributionId = await getContributionId(context, transaction.id, contribution.user.id);

    if (contributionId) {
      await updateEvenContribution(context, contribution.user.id, contributionAmounts, amount, contributionId);
    } else {
      await createEvenContribution(context, contribution.user.id, contributionAmounts, amount, transaction.id);
    }
  });
};

// create and add a new contribution to an existing transaction distributed with percentages
const createContributionWithPercentage = async (context, contribution, contributionAmounts, transactionId) => context.prisma.updateTransaction({
  where: {
    id: transactionId,
  },
  data: {
    contributions: {
      create: {
        user: { connect: { id: contribution.user.id } },
        percentage: contribution.percentage,
        amount: contributionAmounts[contribution.user.id].getAmount(),
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
    amount: contributionAmounts[contribution.user.id].getAmount(),
  },
});

// update all the contributions of an existing transaction distributed with percentages
const updateContributionsWithPercentage = async (context, transaction, amount) => {
  const contributionAmounts = splitWithPercentage(amount, transaction.contributions);

  await transaction.contributions.forEach(async (contribution) => {
    const contributionId = await getContributionId(context, transaction.id, contribution.user.id);

    if (contributionId) {
      await updateContributionWithPercentage(context, contribution, contributionAmounts, contributionId);
    } else {
      await createContributionWithPercentage(context, contribution, contributionAmounts, transaction.id);
    }
  });
};

// delete contributions for users who are no longer involved in a transaction
const deleteOldContributions = async (args, context, transaction) => {
  const fragment = `
  fragment ContributionWithUserId on Contribution {
    user {
      id
    }
  }
  `;
  const oldContributions = await context.prisma.transaction({ id: transaction.id }).contributions().$fragment(fragment);
  const oldContributionUserIds = oldContributions.map((contribution) => contribution.user.id);
  const newContributionUserIds = transaction.contributions.map((contribution) => contribution.user.id);
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
};

const transactionMutations = {
  createTransaction: (root, args, context) => {
    if (inputValidation(args, args.input.contributions.length)) {
      const inputTransaction = {
        paidBy: {
          id: args.input.paidBy,
        },
        isEven: args.input.isEven,
        amount: args.input.amount,
        description: args.input.description,
        group: {
          id: args.input.group,
        },
        contributions: args.input.contributions.map((contribution) => (
          {
            user: {
              id: contribution.user,
            },
            percentage: contribution.percentage,
          }
        )),
      };

      if (inputTransaction.isEven) {
        return createEvenTransaction(context, inputTransaction);
      }
      return createTransactionWithPercentage(context, inputTransaction);
    }
    throw new Error('An error occurred while creating a new transaction.');
  },

  // with the onDelete: CASCADE in the datamodel.prisma, the contributions will be deleted as well
  deleteTransaction: (root, args, context) => context.prisma.deleteTransaction({ id: args.input.transaction }),

  async updateTransactionContributions(root, args, context) {
    if (inputValidation(args, args.input.contributions.length)) {
      const inputTransaction = {
        id: args.input.transaction,
        isEven: args.input.isEven,
        contributions: args.input.contributions.map((contribution) => (
          {
            user: {
              id: contribution.user,
            },
            percentage: contribution.percentage,
          }
        )),
      };

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
    throw new Error('An error occurred while updating a transaction\'s contributions.');
  },

  updateTransactionAmount: async (root, args, context) => {
    const contributionsCount = await context.prisma.contributionsConnection({
      where: {
        transaction: {
          id: args.input.transaction,
        },
      },
    }).aggregate().count();

    if (inputValidation(
      args,
      contributionsCount,
    )) {
      const inputTransaction = {
        id: args.input.transaction,
        amount: args.input.amount,
      };

      const fragment = `
      fragment TransactionWithRelations on Transaction {
        id
        isEven
        contributions {
          user {
            id
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
      id: args.input.transaction,
    },
    data: {
      description: args.input.description,
    },
  }),
};

module.exports = { transactionMutations };
