const Dinero = require('dinero.js');

// split the total amount in even amounts
// contributors is an array of ID's (ex: ["id#1", "id#2", "..."])
const splitEvenly = (amount, contributors) => {
  const splitedDineroAmounts = Dinero({ amount }).allocate(Array(contributors.length).fill(1));

  const distributions = {};
  for (let index = 0; index < contributors.length; index++) {
    distributions[contributors[index]] = splitedDineroAmounts[index];
  }

  return distributions;
};

// split the total amount in amounts determined by the percentages contained in the contributions array
// contriutions is an array of contribution structure (ex: [{user: "userID", amount: null, percentage: <0-100>}])
const splitWithPercentage = (amount, contributions) => {
  const splitedDineroAmounts = Dinero({ amount }).allocate(contributions.map((contribution) => contribution.percentage));

  const distributions = {};
  for (let index = 0; index < contributions.length; index++) {
    distributions[contributions[index].user] = splitedDineroAmounts[index];
  }

  return distributions;
};

// get the percentage of the amount compared to the total amount
const percentOfTotalAmount = (amount, totalAmount) => (amount.getAmount() * 100) / totalAmount;

// verify if the total of all the percentages add up to a hundred
const contributionPercentagesAddUpToHundred = (contributions) => contributions.map((contribution) => contribution.percentage).reduce((total, percentage) => total + percentage) === 100;

const transactionMutations = {
  createEvenTransaction: (root, args, context) => {
    const contributionAmounts = splitEvenly(args.input.amount, args.input.contributors);

    return context.prisma.createTransaction({
      paidBy: { connect: { id: args.input.paidBy } },
      amount: args.input.amount,
      isEven: true,
      description: args.input.description,
      group: { connect: { id: args.input.group } },
      contributions: {
        create: args.input.contributors.map((contributorId) => ({
          user: { connect: { id: contributorId } },
          percentage: percentOfTotalAmount(contributionAmounts[contributorId], args.input.amount),
          amount: contributionAmounts[contributorId].getAmount(),
        })),
      },
    });
  },

  createTransaction: (root, args, context) => {
    if (!contributionPercentagesAddUpToHundred(args.input.contributions)) {
      throw new Error('Percentages doesn\'t add up to a hundred!');
    } else {
      const contributionAmounts = splitWithPercentage(args.input.amount, args.input.contributions);

      return context.prisma.createTransaction({
        paidBy: { connect: { id: args.input.paidBy } },
        amount: args.input.amount,
        isEven: false,
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
  },

  // with the onDelete: CASCADE in the datamodel.prisma, the contributions will be deleted as well
  deleteTransaction: (root, args, context) => context.prisma.deleteTransaction({ id: args.input.transaction }),
};

module.exports = { transactionMutations };
