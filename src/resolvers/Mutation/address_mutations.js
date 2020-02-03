const address_mutations = {
  createAddress: (root, args, context) => context.prisma.createAddress({
    country: args.country,
    province: args.province,
    city: args.city,
    street: args.street,
    apartment_unit: args.apartment_unit,
  }),
}

module.exports = { address_mutations };