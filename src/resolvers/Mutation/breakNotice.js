const fs = require('fs');
const { authenticate, userBelongsToGroup } = require('../../utils.js');
const { Query } = require('../Query/Query.js');

// store the files in filesystem
async function storeFS({ stream, filename }) {
  const uploadDir = 'media';
  const path = `${uploadDir}/${filename}`;
  return new Promise((resolve, reject) => stream
    .on('error', (error) => {
      if (stream.truncated) {
        // delete truncated file
        fs.unlinkSync(path);
      }
      reject(error);
    })
    .pipe(fs.createWriteStream(path))
    .on('error', (error) => reject(error))
    .on('finish', () => resolve({ path })));
}

// delete the files from filesystem
async function deleteFromFS(files) {

}

const breakNoticeMutation = {
  createBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // check if current user belongs to group
      if (!(await userBelongsToGroup(context, res.uid, args.input.groupId))) {
        throw new Error('User does not belong in group.');
      }

      // create the notice before adding the files
      const notice = await context.prisma.createBreakNotice({
        subject: args.input.subject,
        text: args.input.text,
        group: { connect: { id: args.input.groupId } },
        urgencyLevel: args.input.urgencyLevel,
        solved: false,
      });

      await Promise.all(
        args.input.files.map(async (element) => {
          const { filename, createReadStream } = await element;
          const stream = createReadStream();
          const pathObj = await storeFS({ stream, filename });
          const fileLocation = pathObj.path;
          await context.prisma.createFile({
            filename,
            location: fileLocation,
            notice: { connect: { id: notice.id } },
          });
        }),
      );

      return notice;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // fetch group
      const group = await context.prisma.breakNotice({ id: args.input.breakNoticeId }).group();


      // check if current user belongs to group
      if (!(await userBelongsToGroup(context, res.uid, group.id))) {
        throw new Error('User does not belong in group.');
      }

      // delete files linked to current break notice (TODO : delete files from FS)
      await context.prisma.deleteManyFiles({
        notice: { id: args.input.breakNoticeId },
      });

      // update break notice with new data
      const updatedBreakNotice = await context.prisma.updateBreakNotice({
        data: {
          subject: args.input.subject,
          text: args.input.text,
          urgencyLevel: args.input.urgencyLevel,
        },
        where: {
          id: args.input.breakNoticeId,
        },
      });

      await Promise.all(
        args.input.files.map(async (element) => {
          const { filename, createReadStream } = await element;
          const stream = createReadStream();
          const pathObj = await storeFS({ stream, filename });
          const fileLocation = pathObj.path;
          await context.prisma.createFile({
            filename,
            location: fileLocation,
            notice: { connect: { id: args.input.breakNoticeId } },
          });
        }),
      );

      return updatedBreakNotice;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  solveBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      // add group fragment
      const groupFrag = `
      fragment breakNoticeWithGroup on BreakNotice {
        id
        group {
          id
        }
        solved
      }`;

      // fetch break notice
      const breakNotice = await context.prisma.breakNotice({
        id: args.input.id,
      }).$fragment(groupFrag);

      // check if already solved
      if (breakNotice.solved === true) {
        throw new Error('This specific break notice has already been solved.');
      }

      // check if current user belongs to group
      if (!(await userBelongsToGroup(context, res.uid, breakNotice.group.id))) {
        throw new Error('User does not belong in group.');
      }

      const roleFrag = `
      fragment userGroupWithRole on UserGroup {
        role {
          type
        }
      }`;

      const userGroup = await Query.userGroupByIds(
        root, {
          input: {
            userId: res.uid,
            groupId: breakNotice.group.id,
          },
        },
        context,
      ).$fragment(roleFrag);

      // check if current user has landlord role
      if (userGroup[0].role.type !== 'landlord') {
        throw new Error('Only a user with a role of \'landlord\' can solve a break notice.');
      }

      return context.prisma.updateBreakNotice({
        data: {
          solved: true,
        },
        where: {
          id: breakNotice.id,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

module.exports = { breakNoticeMutation };
