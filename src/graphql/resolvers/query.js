const { prisma } = require('../../../generated/prisma-client');

const resolver = {
  Query: {
    user: async (root, { id }) => {
      const fragment = `
      fragment UserWithSchools on User {
        id
        firstName
        lastName
        email
        schools {
          id
          name
        }
      }`;

      const user = await prisma.user({ id }).$fragment(fragment);
      return user;
    },
    schools: async () => {
      const fragment = `
        fragment SchoolWithUsers on School {
          id
          name
          users {
            id
            firstName
            lastName
            email
            userRole
          }
        }
        `;

      const schools = await prisma.schools().$fragment(fragment);
      return schools;
    },
  },
};

module.exports = resolver;
