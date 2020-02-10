const addressMutations = {
  createAddress: (root, args, context) => context.prisma.createAddress({
    country: args.input.country,
    province: args.input.province,
    city: args.input.city,
    street: args.input.street,
    apartment_unit: args.input.apartment_unit,
  }),
};

module.exports = { addressMutations };
