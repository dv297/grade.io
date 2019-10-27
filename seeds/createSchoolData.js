const { prisma } = require('../generated/prisma-client');

// A `main` function so that we can use async/await
async function main() {
  const newSchool = await prisma.createSchool({ name: 'University of Kansas' });
  const schoolId = newSchool.id;

  const newUser = await prisma.createUser({
    firstName: 'Daniel',
    lastName: 'Vu',
    email: 'dv@email.com',
    password: 'password',
    school: {
      connect: {
        id: schoolId,
      },
    },
    userRole: 'TEACHER',
  });
  console.log(`Created new user: ${newUser.name} (ID: ${newUser.id})`);

  const allUsers = await prisma.users();
  console.log(allUsers);
}

main().catch((e) => console.error(e));
