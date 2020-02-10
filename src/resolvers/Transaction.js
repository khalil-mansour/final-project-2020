const Transaction = {

  /* GET transaction paidBy */
  paidBy: (parent, args, context) => context.prisma.transaction({ id: parent.id }).paidBy(),

  /* GET transaction group */
  group: (parent, args, context) => context.prisma.transaction({ id: parent.id }).group(),

  /* GET transaction contributions */
  // eslint-disable-next-line max-len
  contributions: (parent, args, context) => context.prisma.transaction({ id: parent.id }).contributions(),

};

module.exports = { Transaction };
