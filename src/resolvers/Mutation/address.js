const { authenticate } = require('../../utils.js');
const { Query } = require('../Query/Query');

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
        postal_code: args.input.postal_code,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateAddress: async (root, args, context) => {
    try {
      const res = await authenticate(context);
      // fetch user by uid
      const user = await Query.userByFirebase(root, { firebaseId: res.uid }, context);
      return context.prisma.updateAddress({
        data: {
          country: args.input.country,
          province: args.input.province,
          city: args.input.city,
          street: args.input.street,
          apartment_unit: args.input.apartment_unit,
          postal_code: args.input.apartment_unit,
        },
        where: {
          id: args.input.groupId,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { addressMutation };
