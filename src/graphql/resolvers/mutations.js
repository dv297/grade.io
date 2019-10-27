const { prisma } = require('../../../generated/prisma-client');

const resolver = {
  Mutation: {
    createUser: async (root, { createUserInput }) => {
      const prismaCreateUserInput = {
        firstName: createUserInput.firstName,
        lastName: createUserInput.lastName,
        email: createUserInput.email,
        school: {
          connect: {
            id: createUserInput.schoolId,
          },
        },
        userRole: createUserInput.userRole,
      };

      const fragment = `
      fragment UserWithSchool on User {
        id
        firstName
        lastName
        email
        school {
          name
          id
        }
        userRole
      }
      `;
      const newUser = await prisma.createUser(prismaCreateUserInput).$fragment(fragment);

      return {
        user: newUser,
      };
    },
    createSchool: async (root, { createSchoolInput }) => {
      const newSchool = await prisma.createSchool(createSchoolInput);
      return newSchool;
    },
  },
};

module.exports = resolver;
