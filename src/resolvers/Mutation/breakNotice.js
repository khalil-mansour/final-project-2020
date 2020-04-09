const cloudinary = require('cloudinary').v2;
const { authenticate, userBelongsToGroup } = require('../../utils.js');
const { Query } = require('../Query/Query.js');


// store the files in cloudinary
async function uploadToCloud(files, notice, context) {
  return Promise.all(
    files.map(async (element) => {
      const { createReadStream } = await element;
      const stream = createReadStream();
      const result = await cloudinary.uploader.upload(stream.path)
        .then((res) => res)
        .catch((error) => new Error(error));
      return context.prisma.createFile({
        filename: result.public_id,
        cloudinaryUrl: result.secure_url,
        notice: { connect: { id: notice.id } },
      });
    }),
  );
}

// delete files from cloudinary
async function deleteFromCloud(files) {
  return Promise.all(
    files.map(async (element) => cloudinary.uploader.destroy(element.filename)
      .then((result) => result)
      .catch((error) => new Error(error))),
  );
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
        owner: { connect: { firebaseId: res.uid } },
        happenedAt: args.input.happenedAt,
      });

      // upload files to cloudinary
      await uploadToCloud(args.input.filesToUpload, notice, context);

      return notice;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      const frag = `
      fragment breakNoticeWithGroupAndFiles on BreakNotice {
        id
        group {
          id
        }
        files {
          id
          filename
          cloudinaryUrl
        }
        owner {
          firebaseId
        }
      }`;

      // fetch notice
      const notice = await context.prisma
        .breakNotice({ id: args.input.id })
        .$fragment(frag);

      // check if current user belongs to group
      if (!(await userBelongsToGroup(context, res.uid, notice.group.id))) {
        throw new Error('User does not belong in group.');
      }

      // check if user is the owner of the notice
      if (notice.owner.firebaseId !== res.uid) {
        throw new Error('Notice does not belong to user.');
      }

      // delete files from FS
      const deletedFiles = notice.files.filter(
        (file) => !args.input.files.find((fileToFind) => fileToFind.id === file.id),
      );

      if (deletedFiles.length) {
        await deleteFromCloud(deletedFiles);
      }

      // upload new files to cloudinary
      await uploadToCloud(args.input.filesToUpload, notice, context);

      // update break notice with new data
      return context.prisma.updateBreakNotice({
        data: {
          subject: args.input.subject,
          text: args.input.text,
          urgencyLevel: args.input.urgencyLevel,
          files: {
            delete: deletedFiles.map((file) => ({ id: file.id })),
          },
          happenedAt: args.input.happenedAt,
        },
        where: {
          id: args.input.id,
        },
      });
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
      const breakNotice = await context.prisma
        .breakNotice({
          id: args.input.id,
        })
        .$fragment(groupFrag);

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
        root,
        {
          input: {
            userId: res.uid,
            groupId: breakNotice.group.id,
          },
        },
        context,
      ).$fragment(roleFrag);

      // check if current user has landlord role
      if (userGroup[0].role.type !== 'landlord') {
        throw new Error(
          "Only a user with a role of 'landlord' can solve a break notice.",
        );
      }

      return context.prisma.updateBreakNotice({
        data: {
          solved: true,
          solvedAt: new Date(),
        },
        where: {
          id: breakNotice.id,
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteBreakNotice: async (root, args, context) => {
    try {
      const res = await authenticate(context);

      const frag = `
      fragment breakNoticeWithOwnerAndFiles on BreakNotice {
        id
        owner {
          firebaseId
        }
        files {
          filename
        }
      }`;

      // fetch notice
      const notice = await context.prisma
        .breakNotice({ id: args.input.id })
        .$fragment(frag);

      // check if notice exists
      if (!notice) {
        throw new Error('No notice found with this id.');
      }

      // check if user is the owner of the notice
      if (notice.owner.firebaseId !== res.uid) {
        throw new Error('Notice does not belong to user.');
      }

      // delete files linked to notice on cloudinary
      await deleteFromCloud(notice.files);

      return context.prisma.deleteBreakNotice({ id: args.input.id });
    } catch (error) {
      throw new Error(error);
    }
  },
};

module.exports = { breakNoticeMutation };
