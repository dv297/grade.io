const checkAuthentication = require('../../utils/checkAuthentication');

const resolver = {
  Query: {
    user: async (root, { id }, context) => {
      checkAuthentication(context);

      const fragment = `
      fragment UserWithSchools on User {
        id
        firstName
        lastName
        email
        school {
          id
          name
        }
      }`;

      const user = await context.prisma.user({ id }).$fragment(fragment);
      return user;
    },
    schools: async (root, arguments, context) => {
      checkAuthentication(context);

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

      const schools = await context.prisma.schools().$fragment(fragment);
      return schools;
    },
  },
};

module.exports = resolver;
