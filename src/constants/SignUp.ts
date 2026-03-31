import { faker } from '@faker-js/faker';

export const SignUpCreds = {
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  userName: `U${Date.now()}`,
  emailAddress: faker.internet.email(),
  password: '123456789@Aa',
};

export const duplicateUserSignUpCreds = {
  firstName: 'Jordyn',
  lastName: 'McClure',
  userName: `U1774418872946`,
  emailAddress: 'Davion_Kovacek@gmail.com',
  password: '123456789@Aa',
};
