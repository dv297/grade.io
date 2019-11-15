const { prisma } = require('../../../generated/prisma-client');
const checkAuthentication = require('../../utils/checkAuthentication');

const resolver = {
  Query: {
    user: async (root, { id }, context) => {
      checkAuthentication(context);

      const user = await prisma.user({ id });
      return user;
    },
    schools: async (root, arguments, context) => {
      checkAuthentication(context);

      const schools = await prisma.schools();
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
    school: async (root) => {
      const school = await prisma.user({ id: root.id }).school();
      return school;
    },
    teacher: async (root) => {
      const teacher = await prisma.teacher({ id: root.teacher.id });

      return {
        id: teacher.id,
        classes: teacher.class ? teacher.classes : [],
      };
    },
  },
  Schools: {
    users: async (root) => {
      const users = await prisma.school({ id: root.id }).users();
      return users;
    },
  },
};

module.exports = resolver;
