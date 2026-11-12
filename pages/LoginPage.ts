import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model untuk Halaman Login SIAKAD Polinema
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Resilient User-Facing Locators (Tier 1) dengan fallback
    this.usernameInput = page.getByRole('textbox', { name: /username/i })
      .or(page.locator('input[name="username"]'));

    this.passwordInput = page.getByPlaceholder(/password/i)
      .or(page.locator('input[type="password"]'))
      .or(page.getByRole('textbox', { name: /password/i }));

    this.loginButton = page.getByRole('button', { name: /login|masuk/i })
      .or(page.locator('button[type="submit"], input[type="submit"]'));

    // Pesan error saat gagal login (alert banner atau text error)
    this.errorMessage = page.locator('.alert-danger, .alert-warning, .alert, #error-message, .text-danger')
      .or(page.getByText(/gagal|salah|tidak valid|error/i));
  }

  /**
   * Menuju ke halaman login SIAKAD dengan auto-retry toPass()
   * Kebal terhadap transient ERR_CONNECTION_RESET atau server latency
   */
  async goto() {
    await expect(async () => {
      await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
      await expect(this.loginButton.first()).toBeVisible({ timeout: 10000 });
    }).toPass({ intervals: [2000, 4000], timeout: 45000 });
  }

  /**
   * Mengisi kredensial dan melakukan submit login
   */
  async login(username: string, pass: string) {
    await this.usernameInput.first().fill(username);
    await this.passwordInput.first().fill(pass);
    await this.loginButton.first().click();
  }

  /**
   * Verifikasi skenario login gagal
   */
  async verifyLoginFailed() {
    // Tombol login masih tetap terlihat dan/atau muncul pesan error
    await expect(this.loginButton.first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verifikasi skenario login sukses
   */
  async verifyLoginSuccess() {
    // Pengguna diarahkan ke halaman beranda
    await expect(this.page).toHaveURL(/beranda/, { timeout: 25000 });
  }
}
