// Run while server is up

require('dotenv').config();
const { request, GraphQLClient } = require('graphql-request');

const seedSampleData = require('../seedSampleData');

async function createSchool() {
  const graphqlApiUrl = 'http://localhost:4000/graphql';

  const createAdminMutation = `
  mutation {
    createApplicationAdmin(
      createApplicationAdminInput: {
        createAdminSecret: "${process.env.CREATE_ADMIN_SECRET}"
        firstName: "${seedSampleData.admin.firstName}"
        lastName: "${seedSampleData.admin.lastName}"
        email: "${seedSampleData.admin.email}"
        password: "${seedSampleData.admin.password}"
      }
    ) {
      token
      admin {
        id
        firstName
        lastName
        email
      }
    }
  }`;

  const result = await request(graphqlApiUrl, createAdminMutation);

  console.log('* Admin created');

  const {
    createApplicationAdmin: { token },
  } = result;

  const createSchoolMutation = `
  mutation {
    createSchool(createSchoolInput: { name: "${seedSampleData.school.name}" }) {
      id
      name
    }
  }`;

  const client = new GraphQLClient(graphqlApiUrl, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const schoolResult = await client.request(createSchoolMutation);

  console.log('* School created: ' + schoolResult.createSchool.name);

  const createTeacherMutation = `
  mutation {
    signup(userSignupInput:{
      email: "${seedSampleData.teacher.email}",
      password: "${seedSampleData.teacher.password}",
      firstName: "${seedSampleData.teacher.firstName}",
      lastName: "${seedSampleData.teacher.lastName}",
      schoolId: "${schoolResult.createSchool.id}",
      userRole: TEACHER
    }) {
      token
      user {
        id
        firstName
        lastName
        email
        school {
          name
        }
        userRole
        teacher {
          id
        }
      }
    }
  }`;

  const teacherResult = await client.request(createTeacherMutation);
  console.log('* Teacher created: ' + teacherResult.signup.user.firstName + ' ' + teacherResult.signup.user.lastName);

  const createStudentMutation = `
  mutation {
    signup(userSignupInput: {
      email: "${seedSampleData.student.email}",
      password: "${seedSampleData.student.password}",
      firstName: "${seedSampleData.student.firstName}",
      lastName: "${seedSampleData.student.lastName}",
      schoolId: "${schoolResult.createSchool.id}",
      userRole: STUDENT 
    }) {
      token
      user {
        id
        firstName
        lastName
        email
        school {
          name
        }
        userRole
      }
    }
  }`;

  const studentResult = await client.request(createStudentMutation);
  console.log('* Student created: ' + studentResult.signup.user.firstName + ' ' + studentResult.signup.user.lastName);

  const loginMutation = `
  mutation {
    login(userLoginInput:{
      email: "${studentResult.signup.user.email}",
      password: "${seedSampleData.student.password}"
    }) {
      token
    }
  }`;

  console.log('* Attempting login...');
  await client.request(loginMutation);
  console.log('* Login was successful!');

  const createClassMutation = `
  mutation {
    createClass(createClassInput: {teacherId: "${teacherResult.signup.user.teacher.id}", name: "Full Stack Bootcamp"}) {
      class {
        id
        name
      }
    }
  }`;

  const createClassResult = await client.request(createClassMutation);
  console.log('Class created: ' + createClassResult.createClass.class.name);
}

createSchool();
