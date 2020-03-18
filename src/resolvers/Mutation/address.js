const { authenticate } = require('../../utils.js');

const addressMutation = {
  updateAddress: async (root, args, context) => {
    try {
      await authenticate(context);
      return context.prisma.updateAddress({
        data: {
          country: args.input.country,
          province: args.input.province,
          city: args.input.city,
          street: args.input.street,
          apartmentUnit: args.input.apartmentUnit,
          postalCode: args.input.apartmentUnit,
        },
        where: {
          id: args.input.addressId,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { addressMutation };
