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

// TODO - link to transaction
const createEvenContribution = (root, args, context, contribution, contributionAmounts, amount) => context.prisma.createContribution({
  user: { connect: { id: contribution.user } },
  percentage: percentOfTotalAmount(contributionAmounts[contribution.user], amount),
  amount: contributionAmounts[contribution.user].getAmount(),
});

const updateEvenContribution = (root, args, context, contribution, contributionAmounts, amount) => context.prisma.updateContribution({
  where: {
    user: {
      id: contribution.user,
    },
    transaction: {
      id: args.input.transaction,
    },
  },
  data: {
    percentage: percentOfTotalAmount(contributionAmounts[contribution.user], amount),
    amount: contributionAmounts[contribution.user].getAmount(),
  },
});

const updateEvenContributions = (root, args, context, amount) => {
  const contributionAmounts = splitEvenly(amount, args.input.contributions);

  args.input.contributions.forEach((contribution) => {
    if (context.prisma.$exists.contribution({
      user: {
        id: contribution.user,
      },
      transaction: {
        id: args.input.transaction,
      },
    })) {
      updateEvenContribution(root, args, context, contribution, contributionAmounts, amount);
    } else {
      createEvenContribution(root, args, context, contribution, contributionAmounts, amount);
    }
  });
};

// TODO - link to transaction
const createContributionWithPercentage = (root, args, context, contribution, contributionAmounts) => context.prisma.createContribution({
  user: { connect: { id: contribution.user } },
  percentage: contribution.percentage,
  amount: contributionAmounts[contribution.user].getAmount(),
});

const updateContributionWithPercentage = (root, args, context, contribution, contributionAmounts) => context.prisma.updateContribution({
  where: {
    user: {
      id: contribution.user,
    },
    transaction: {
      id: args.input.transaction,
    },
  },
  data: {
    percentage: contribution.percentage,
    amount: contributionAmounts[contribution.user].getAmount(),
  },
});

const updateContributionsWithPercentage = (root, args, context, amount) => {
  const contributionAmounts = splitWithPercentage(amount, args.input.contributions);

  args.input.contributions.forEach((contribution) => {
    if (context.prisma.$exists.contribution({
      user: {
        id: contribution.user,
      },
      transaction: {
        id: args.input.transaction,
      },
    })) {
      updateContributionWithPercentage(root, args, context, contribution, contributionAmounts);
    } else {
      createContributionWithPercentage(root, args, context, contribution, contributionAmounts);
    }
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

  updateTransactionContributions: (root, args, context) => {
    const { amount } = context.prisma.transaction({ id: args.input.transaction });

    if (args.input.isEven) {
      updateEvenContributions(root, args, context, amount);
    } else {
      updateContributionsWithPercentage(root, args, context, amount);
    }
  },
};

module.exports = { transactionMutations };
