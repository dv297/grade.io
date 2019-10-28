const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    createApplicationAdmin: async (root, { createApplicationAdminInput }, context) => {
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

      const user = await context.prisma.createApplicationAdmin(prismaCreateApplicationAdminInput);

      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

      return {
        token,
        user,
      };
    },
    signup: async (root, { userSignupInput }, context) => {
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

      const user = await context.prisma.createUser(prismaCreateUserInput).$fragment(userWithSchoolFragment);

      const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

      return {
        token,
        user,
      };
    },
    login: async (root, { userLoginInput }, context) => {
      const potentialUser = await context.prisma.user({ email: userLoginInput.email });

      if (!potentialUser) {
        throw new Error('Login Error');
      }

      const valid = await bcrypt.compare(userLoginInput.password, potentialUser.password);
      if (!valid) {
        throw new Error('Login Error');
      }

      const token = jwt.sign({ userId: potentialUser.id }, process.env.APP_SECRET);
      const user = await context.prisma.user({ id: potentialUser.id }).$fragment(userWithSchoolFragment);

      return {
        token,
        user,
      };
    },
    createSchool: async (root, { createSchoolInput }, context) => {
      checkAuthentication(context);

      const newSchool = await context.prisma.createSchool(createSchoolInput);
      return newSchool;
    },
  },
};

module.exports = resolver;
