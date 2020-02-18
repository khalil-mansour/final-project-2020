const { authenticate } = require('../../utils.js');


const addressMutation = {
  createAddress: async (root, args, context) => {
    const res = await authenticate(context);
    return await context.prisma.createAddress({
      country: args.input.country,
      province: args.input.province,
      city: args.input.city,
      street: args.input.street,
      apartment_unit: args.input.apartment_unit,
    })
    .catch((error) => {
      throw new Error(error.message);      
    })
  }
};

module.exports = { addressMutation };
