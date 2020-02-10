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

  // with the onDelete: CASCADE in the datamodel.prisma, the contributions will be deleted as well
  deleteTransaction: (root, args, context) => context.prisma.deleteTransaction({ id: args.input.transaction }),
};

module.exports = { transactionMutations };
