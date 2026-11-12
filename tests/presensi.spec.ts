import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PresensiPage } from '../pages/PresensiPage';

test.describe('Alur 2: Modul Presensi & Rekapitulasi Kehadiran Mahasiswa', () => {
  let presensiPage: PresensiPage;

  test.beforeEach(async ({ page }) => {
    test.skip(
      !process.env.SIAKAD_USER || !process.env.SIAKAD_PASS,
      'SIAKAD_USER atau SIAKAD_PASS belum diisi di file .env'
    );

    // 1. Login terlebih dahulu pada setiap pengujian (menghindari limit single session SIAKAD)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(process.env.SIAKAD_USER!, process.env.SIAKAD_PASS!);
    await loginPage.verifyLoginSuccess();

    presensiPage = new PresensiPage(page);
  });

  test('Pengguna membuka menu Akademik > Presensi, memfilter tahun ajaran, dan memverifikasi data Alpha, Ijin, Sakit', async () => {
    // 1. Klik menu dropdown Akademik lalu klik submenu Presensi
    await presensiPage.navigasiKePresensi();

    // 2. Pilih Tahun Ajaran dan klik tombol Filter
    await presensiPage.filterTahunAjaran('2025/2026 Ganjil');

    // 3. Verifikasi tabel memuat data presensi (Mata Kuliah, Alpha, Ijin, Sakit, serta Total AIS)
    await presensiPage.verifikasiTabelPresensi();
  });
});
