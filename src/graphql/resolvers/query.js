const { prisma } = require('../../../generated/prisma-client');
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
        teacher {
          id
        }
      }`;

      const user = await prisma.user({ id }).$fragment(fragment);
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

      const schools = await prisma.schools().$fragment(fragment);
      return schools;
    },
    teacher: async (root, { id }, context) => {
      checkAuthentication(context);

      const fragment = `
        fragment TeacherWithUser on Teacher {
          id
          user {
            id
            firstName
            lastName
            email
            userRole
          }
        }
      `;

      const teachers = await prisma.teacher({ id }).$fragment(fragment);
      return teachers;
    },
    teachers: async (root, arguments, context) => {
      checkAuthentication(context);

      const fragment = `
        fragment TeacherWithUser on Teacher {
          id
          user {
            id
            firstName
            lastName
            email
            userRole
          }
        }
      `;

      const teachers = await prisma.teachers().$fragment(fragment);
      return teachers;
    },
  },
  User: {
    teacher: async (root) => {
      const teacher = await prisma.teacher({ id: root.teacher.id });

      return {
        id: teacher.id,
        classes: teacher.class ? teacher.classes : [],
      };
    },
  },
};

module.exports = resolver;
