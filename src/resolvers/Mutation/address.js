const { authenticate } = require('../../utils.js');

const addressMutation = {
  createAddress: async (root, args, context) => {
    try {
      await authenticate(context);
      return context.prisma.createAddress({
        country: args.input.country,
        province: args.input.province,
        city: args.input.city,
        street: args.input.street,
        apartment_unit: args.input.apartment_unit,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateAddress: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // fetch user by uid
      const user = await context.prisma.user({ userId: res.uid });
      return context.prisma.updateAddress({
        data: {
          country: args.input.country,
          province: args.input.province,
          city: args.input.city,
          street: args.input.street,
          apartment_unit: args.input.apartment_unit,
        },
        where: {
          id: user.id,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { addressMutation };
