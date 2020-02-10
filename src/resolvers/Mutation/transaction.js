const transactionMutations = {
  createTransaction: (root, args, context) => context.prisma.createTransaction({
    paidBy: { connect: { id: args.input.paidBy } },
    amount: args.input.amount,
    description: args.input.description,
    group: { connect: { id: args.input.group } },
    contributions: {
      create: args.input.contributions.map((contribution) => ({
        user: { connect: { id: contribution.user } },
        percentage: contribution.percentage,
      })),
    },
  }),
};

module.exports = { transactionMutations };
