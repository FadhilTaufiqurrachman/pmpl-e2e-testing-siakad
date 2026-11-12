import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Alur 1: Autentikasi Pengguna SIAKAD Polinema', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Skenario Negatif: Gagal login dengan password tidak valid', async ({ page }) => {
    // Jalankan pengujian dengan username/dummy dan password salah
    const testUser = process.env.SIAKAD_USER || 'dummy_mahasiswa';
    await loginPage.login(testUser, 'PasswordPalsu123!');

    // Verifikasi bahwa user tetap di halaman login dan tombol login masih ada
    await loginPage.verifyLoginFailed();
    expect(page.url()).not.toContain('/beranda');
  });

  test('Skenario Positif: Berhasil login dengan akun mahasiswa valid', async ({ page }) => {
    test.skip(
      !process.env.SIAKAD_USER || !process.env.SIAKAD_PASS,
      'SIAKAD_USER atau SIAKAD_PASS belum diisi di file .env'
    );

    await loginPage.login(process.env.SIAKAD_USER!, process.env.SIAKAD_PASS!);

    // Web-First Assertion: Verifikasi pengalihan ke URL /beranda
    await loginPage.verifyLoginSuccess();
  });
});

