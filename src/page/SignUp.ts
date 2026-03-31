import type { Page } from '@playwright/test';

type SignUpField =
  | 'firstName'
  | 'lastName'
  | 'userName'
  | 'emailAddress'
  | 'password'
  | 'confirmPassword';

type SignUpFormData = Record<SignUpField, string>;

export class SignUp {
  private static signUp: SignUp | null = null;

  private page: Page;

  private formData: Partial<SignUpFormData> = {};

  private shouldAcceptPrivacyPolicy = false;

  private constructor(page: Page) {
    this.page = page;
  }

  static getSignUpPageObject(page: Page): SignUp {
    if (SignUp.signUp === null) {
      SignUp.signUp = new SignUp(page);
    } else {
      SignUp.signUp.page = page;
      SignUp.signUp.reset();
    }

    return SignUp.signUp;
  }

  withFirstName(firstName: string): this {
    this.formData.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.formData.lastName = lastName;
    return this;
  }

  withUserName(userName: string): this {
    this.formData.userName = userName;
    return this;
  }

  withEmail(emailAddress: string): this {
    this.formData.emailAddress = emailAddress;
    return this;
  }

  withPassword(password: string): this {
    this.formData.password = password;
    return this;
  }

  withConfirmPassword(confirmPassword = this.formData.password): this {
    this.formData.confirmPassword = confirmPassword;
    return this;
  }

  acceptPrivacyPolicy(): this {
    this.shouldAcceptPrivacyPolicy = true;
    return this;
  }

  async createAccount(): Promise<void> {
    await this.page
      .getByLabel(/^First Name\s*\*?$/)
      .fill(this.getRequiredField('firstName'));
    await this.page
      .getByLabel(/^Last Name\s*\*?$/)
      .fill(this.getRequiredField('lastName'));
    await this.page
      .getByLabel(/^Username\s*\*?$/)
      .fill(this.getRequiredField('userName'));
    await this.page
      .getByLabel(/^Email\s*\*?$/)
      .fill(this.getRequiredField('emailAddress'));
    await this.page
      .getByLabel(/^Password\s*\*?$/)
      .fill(this.getRequiredField('password'));
    await this.page
      .getByLabel(/^Password Confirmation\s*\*?$/)
      .fill(this.getRequiredField('confirmPassword'));

    if (this.shouldAcceptPrivacyPolicy) {
      await this.checkPrivacyPolicy();
    }

    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  async checkPrivacyPolicy(): Promise<void> {
    await this.page
      .getByLabel(/By checking the box, I agree to the Privacy Policy/i)
      .check();
    await this.page.getByLabel(/By checking the applicable box below/i).check();
  }

  private getRequiredField(fieldName: SignUpField): string {
    const value = this.formData[fieldName];

    if (!value) {
      throw new Error(`Missing required signup field: ${fieldName}`);
    }

    return value;
  }

  private reset(): void {
    this.formData = {};
    this.shouldAcceptPrivacyPolicy = false;
  }
}
