const Dinero = require('dinero.js');

// returns a dictionary indicating the correspondence between a user and the amount of his contribution
const getSplitDistribution = (splitedDineroAmounts, contributions) => {
  const distribution = {};
  for (let index = 0; index < contributions.length; index++) {
    distribution[contributions[index].user] = splitedDineroAmounts[index];
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

// create a new transaction with a total amount splitted evenly between contributors
const createEvenTransaction = (root, args, context) => {
  const contributionAmounts = splitEvenly(args.input.amount, args.input.contributions);

  return context.prisma.createTransaction({
    paidBy: { connect: { id: args.input.paidBy } },
    amount: args.input.amount,
    isEven: args.input.isEven,
    description: args.input.description,
    group: { connect: { id: args.input.group } },
    contributions: {
      create: args.input.contributions.map((contribution) => ({
        user: { connect: { id: contribution.user } },
        percentage: percentOfTotalAmount(contributionAmounts[contribution.user], args.input.amount),
        amount: contributionAmounts[contribution.user].getAmount(),
      })),
    },
  });
};

// create a new transaction with a total amount distributed among contributors according to their contribution percentage
const createTransactionWithPercentage = (root, args, context) => {
  if (!contributionPercentagesAddUpToHundred(args.input.contributions)) {
    throw new Error('Percentages doesn\'t add up to a hundred!');
  } else {
    const contributionAmounts = splitWithPercentage(args.input.amount, args.input.contributions);

    return context.prisma.createTransaction({
      paidBy: { connect: { id: args.input.paidBy } },
      amount: args.input.amount,
      isEven: args.input.isEven,
      description: args.input.description,
      group: { connect: { id: args.input.group } },
      contributions: {
        create: args.input.contributions.map((contribution) => ({
          user: { connect: { id: contribution.user } },
          percentage: contribution.percentage,
          amount: contributionAmounts[contribution.user].getAmount(),
        })),
      },
    });
  }
};

// create and add a new contribution to an equally distributed existing transaction
const createEvenContribution = async (root, args, context, contribution, contributionAmounts, amount) => context.prisma.updateTransaction({
  where: {
    id: args.input.transaction,
  },
  data: {
    contributions: {
      create: {
        user: { connect: { id: contribution.user } },
        percentage: percentOfTotalAmount(contributionAmounts[contribution.user], amount),
        amount: contributionAmounts[contribution.user].getAmount(),
      },
    },
  },
});

// update a contribution of an equally distributed existing transaction
const updateEvenContribution = async (root, args, context, contribution, contributionAmounts, amount, contributionId) => context.prisma.updateContribution({
  where: {
    id: contributionId,
  },
  data: {
    percentage: percentOfTotalAmount(contributionAmounts[contribution.user], amount),
    amount: contributionAmounts[contribution.user].getAmount(),
  },
});

// update all the contributions of an equally distributed existing transaction
const updateEvenContributions = async (root, args, context, amount) => {
  const contributionAmounts = splitEvenly(amount, args.input.contributions);

  await args.input.contributions.forEach(async (contribution) => {
    const contributionId = await getContributionId(context, args.input.transaction, contribution.user);

    if (contributionId) {
      await updateEvenContribution(root, args, context, contribution, contributionAmounts, amount, contributionId);
    } else {
      await createEvenContribution(root, args, context, contribution, contributionAmounts, amount);
    }
  });
};

// create and add a new contribution to an existing transaction distributed with percentages
const createContributionWithPercentage = async (root, args, context, contribution, contributionAmounts) => context.prisma.updateTransaction({
  where: {
    id: args.input.transaction,
  },
  data: {
    contributions: {
      create: {
        user: { connect: { id: contribution.user } },
        percentage: contribution.percentage,
        amount: contributionAmounts[contribution.user].getAmount(),
      },
    },
  },
});

// update a contribution of an existing transaction distributed with percentages
const updateContributionWithPercentage = async (root, args, context, contribution, contributionAmounts, contributionId) => context.prisma.updateContribution({
  where: {
    id: contributionId,
  },
  data: {
    percentage: contribution.percentage,
    amount: contributionAmounts[contribution.user].getAmount(),
  },
});

// update all the contributions of an existing transaction distributed with percentages
const updateContributionsWithPercentage = async (root, args, context, amount) => {
  const contributionAmounts = splitWithPercentage(amount, args.input.contributions);

  await args.input.contributions.forEach(async (contribution) => {
    const contributionId = await getContributionId(context, args.input.transaction, contribution.user);

    if (contributionId) {
      await updateContributionWithPercentage(root, args, context, contribution, contributionAmounts, contributionId);
    } else {
      await createContributionWithPercentage(root, args, context, contribution, contributionAmounts);
    }
  });
};

// delete contributions for users who are no longer involved in a transaction
const deleteOldContributions = async (args, context) => {
  const fragment = `
  fragment ContributionWithUserId on Contribution {
    user {
      id
    }
  }
  `;
  const oldContributions = await context.prisma.transaction({ id: args.input.transaction }).contributions().$fragment(fragment);
  const oldContributionUserIds = oldContributions.map((contribution) => contribution.user.id);
  const newContributionUserIds = args.input.contributions.map((contribution) => contribution.user);
  const contributionToDeleteUserIds = oldContributionUserIds.filter((userId) => !newContributionUserIds.includes(userId));

  return context.prisma.updateTransaction({
    where: {
      id: args.input.transaction,
    },
    data: {
      contributions: {
        delete: await Promise.all(contributionToDeleteUserIds.map(async (userId) => ({
          id: await getContributionId(context, args.input.transaction, userId),
        }))),
      },
    },
  });
};

const transactionMutations = {
  createTransaction: (root, args, context) => {
    if (args.input.isEven) {
      return createEvenTransaction(root, args, context);
    }
    return createTransactionWithPercentage(root, args, context);
  },

  // with the onDelete: CASCADE in the datamodel.prisma, the contributions will be deleted as well
  deleteTransaction: (root, args, context) => context.prisma.deleteTransaction({ id: args.input.transaction }),

  async updateTransactionContributions(root, args, context) {
    const amount = await context.prisma.transaction({ id: args.input.transaction }).amount();

    if (args.input.isEven) {
      await updateEvenContributions(root, args, context, amount);
    } else {
      await updateContributionsWithPercentage(root, args, context, amount);
    }

    await deleteOldContributions(args, context);

    // update isEven field for the concerned transaction
    return context.prisma.updateTransaction({
      where: {
        id: args.input.transaction,
      },
      data: {
        isEven: args.input.isEven,
      },
    });
  },
};

module.exports = { transactionMutations };
