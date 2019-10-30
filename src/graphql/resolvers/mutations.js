const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { prisma } = require('../../../generated/prisma-client');

const checkAuthentication = require('../../utils/checkAuthentication');

const userWithSchoolFragment = `
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
      }`;

const resolver = {
  Mutation: {
    createApplicationAdmin: async (root, { createApplicationAdminInput }) => {
      const createAdminSecret = process.env.CREATE_ADMIN_SECRET;

      if (createApplicationAdminInput.createAdminSecret !== createAdminSecret) {
        throw new Error('Invalid secret');
      }

      const password = await bcrypt.hash(createApplicationAdminInput.password, 10);

      const prismaCreateApplicationAdminInput = {
        firstName: createApplicationAdminInput.firstName,
        lastName: createApplicationAdminInput.lastName,
        email: createApplicationAdminInput.email,
        password,
      };

      const user = await prisma.createApplicationAdmin(prismaCreateApplicationAdminInput);

      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

      return {
        token,
        user,
      };
    },
    signup: async (root, { userSignupInput }) => {
      const password = await bcrypt.hash(userSignupInput.password, 10);

      const prismaCreateUserInput = {
        firstName: userSignupInput.firstName,
        lastName: userSignupInput.lastName,
        email: userSignupInput.email,
        school: {
          connect: {
            id: userSignupInput.schoolId,
          },
        },
        userRole: userSignupInput.userRole,
        password,
      };

      const user = await prisma.createUser(prismaCreateUserInput).$fragment(userWithSchoolFragment);

      let teacher;
      if (userSignupInput.userRole === 'TEACHER') {
        teacher = await prisma.createTeacher({ user: { connect: { id: user.id } } });
      }

      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

      return {
        token,
        user: {
          ...user,
          teacher,
        },
      };
    },
    login: async (root, { userLoginInput }) => {
      const potentialUser = await prisma.user({ email: userLoginInput.email });

      if (!potentialUser) {
        throw new Error('Login Error');
      }

      const valid = await bcrypt.compare(userLoginInput.password, potentialUser.password);
      if (!valid) {
        throw new Error('Login Error');
      }

      const token = jwt.sign({ userId: potentialUser.id }, process.env.APP_SECRET);
      const user = await prisma.user({ id: potentialUser.id }).$fragment(userWithSchoolFragment);

      return {
        token,
        user,
      };
    },
    createSchool: async (root, { createSchoolInput }, context) => {
      checkAuthentication(context);

      const newSchool = await prisma.createSchool(createSchoolInput);
      return newSchool;
    },
    createClass: async (root, { createClassInput }, context) => {
      checkAuthentication(context);

      const newClass = await prisma.createClass({
        name: createClassInput.name,
        teacher: {
          connect: {
            id: createClassInput.teacherId,
          },
        },
      });

      return {
        class: newClass,
      };
    },
  },
};

module.exports = resolver;
