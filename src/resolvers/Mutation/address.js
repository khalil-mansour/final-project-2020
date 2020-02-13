const { authenticate } = require('../../utils.js');


const addressMutation = {
  createAddress: (root, args, context) => authenticate(context)
    .then((res) => context.prisma.createAddress({
      country: args.input.country,
      province: args.input.province,
      city: args.input.city,
      street: args.input.street,
      apartment_unit: args.input.apartment_unit,
    }))
    .catch((error) => {
      console.error(error);
      return error;
    }),
};

module.exports = { addressMutation };
