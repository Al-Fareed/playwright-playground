import { expect, test } from '@playwright/test';
import { duplicateUserSignUpCreds, SignUpCreds } from '../src/constants/SignUp';
import { NetworkLogger } from '../src/lib/NetworkLogger';
import { SignUp } from '../src/page/SignUp';

let signUp: SignUp;

test.beforeEach(async ({ page }, testInfo) => {
  NetworkLogger.attach(page, testInfo.title);
  signUp = SignUp.getSignUpPageObject(page);
  await page.goto('/agent-signup');
});

test('user should be able to create account', async ({ page }) => {
  await signUp
    .withFirstName(SignUpCreds.firstName)
    .withLastName(SignUpCreds.lastName)
    .withUserName(SignUpCreds.userName)
    .withEmail(SignUpCreds.emailAddress)
    .withPassword(SignUpCreds.password)
    .withConfirmPassword()
    .acceptPrivacyPolicy()
    .createAccount();

  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/One Real: Agent Onboarding/);
});

test('user shouldnt be able to create duplicate account', async ({ page }) => {
  await signUp
    .withFirstName(duplicateUserSignUpCreds.firstName)
    .withLastName(duplicateUserSignUpCreds.lastName)
    .withUserName(duplicateUserSignUpCreds.userName)
    .withEmail(duplicateUserSignUpCreds.emailAddress)
    .withPassword(duplicateUserSignUpCreds.password)
    .withConfirmPassword()
    .acceptPrivacyPolicy()
    .createAccount();

  await expect(
    page.getByText('Username is already taken', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Email is already taken', { exact: true }),
  ).toBeVisible();
});
