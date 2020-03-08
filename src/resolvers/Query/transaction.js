const transactionQuery = {
  /* GET single transaction by ID */
  transaction: async (root, args, context) => `a temporary transaction${root}${args}${context}`,
};

module.exports = { transactionQuery };
