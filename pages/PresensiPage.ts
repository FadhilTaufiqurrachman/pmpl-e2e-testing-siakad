import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model untuk Halaman Presensi SIAKAD Polinema
 * Alur:
 * 1. Buka menu dropdown 'Akademik' di sidebar
 * 2. Klik submenu 'Presensi'
 * 3. Pilih Tahun Akademik pada dropdown
 * 4. Klik tombol 'Filter'
 * 5. Verifikasi tabel absensi: MATA KULIAH, ALPHA, IJIN, SAKIT, serta Total AIS
 */
export class PresensiPage {
  readonly page: Page;
  readonly menuAkademik: Locator;
  readonly subMenuPresensi: Locator;
  readonly headingPresensi: Locator;
  readonly tahunAjaranSelect: Locator;
  readonly filterButton: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;

    // Menu Sidebar
    this.menuAkademik = page.locator('a').filter({ hasText: /^Akademik/i })
      .or(page.getByRole('link', { name: /akademik/i }));

    this.subMenuPresensi = page.locator('a').filter({ hasText: /^Presensi$/i })
      .or(page.getByRole('link', { name: 'Presensi', exact: true }));

    // Elemen Halaman Presensi
    this.headingPresensi = page.getByText(/data presensi mahasiswa|data absensi alpha, ijin, dan sakit mahasiswa/i);

    // Dropdown Tahun Ajaran dan Tombol Filter
    this.tahunAjaranSelect = page.locator('select');
    this.filterButton = page.getByRole('button', { name: /filter/i })
      .or(page.locator('button:has-text("Filter")'));

    // Indikator Loading AJAX SIAKAD
    this.loadingIndicator = page.getByText(/loading|memuat|mohon tunggu/i)
      .or(page.locator('.loading, #loading'));
  }

  /**
   * Membuka menu navigasi Akademik -> Presensi
   * Menggunakan retry toPass() agar tahan terhadap JS timing bootstrap toggle
   */
  async navigasiKePresensi() {
    await expect(async () => {
      // Jika submenu Presensi belum terlihat, klik menu Akademik
      if (!(await this.subMenuPresensi.first().isVisible())) {
        await this.menuAkademik.first().click();
      }
      // Tunggu hingga submenu Presensi muncul
      await expect(this.subMenuPresensi.first()).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });

    // Klik submenu Presensi
    await this.subMenuPresensi.first().click();

    // Tunggu konten halaman Presensi termuat
    await expect(this.headingPresensi.first()).toBeVisible({ timeout: 20000 });
    await this.tungguLoadingSelesai();
  }

  /**
   * Memilih Tahun Ajaran dan menekan tombol Filter
   * @param labelTahun (opsional, misalnya: '2025/2026 Ganjil')
   */
  async filterTahunAjaran(labelTahun?: string) {
    await expect(this.tahunAjaranSelect.first()).toBeVisible({ timeout: 10000 });

    if (labelTahun) {
      await this.tahunAjaranSelect.first().selectOption({ label: labelTahun });
    } else {
      // Pilih opsi yang tersedia
      const count = await this.tahunAjaranSelect.first().locator('option').count();
      if (count > 0) {
        // Pilih opsi paling relevan atau opsi pertama
        await this.tahunAjaranSelect.first().selectOption({ index: 0 });
      }
    }

    // Klik tombol Filter
    await expect(this.filterButton.first()).toBeVisible({ timeout: 10000 });
    await this.filterButton.first().click();

    // Tunggu respon filter selesai diproses
    await this.tungguLoadingSelesai();
  }

  /**
   * Menunggu indikator loading selesai jika muncul
   */
  async tungguLoadingSelesai() {
    try {
      if (await this.loadingIndicator.first().isVisible()) {
        await expect(this.loadingIndicator.first()).toBeHidden({ timeout: 15000 });
      }
    } catch {
      // Abaikan jika indikator loading tidak tampil
    }
  }

  /**
   * Verifikasi keberadaan tabel absensi dan kolom Alpha, Ijin, Sakit, serta Total AIS
   */
  async verifikasiTabelPresensi() {
    // 1. Pastikan tabel presensi tampil di layar
    const table = this.page.locator('table');
    await expect(table.first()).toBeVisible({ timeout: 15000 });

    // 2. Verifikasi header tabel kritis: MATA KULIAH, ALPHA, IJIN, SAKIT
    const headerMataKuliah = this.page.locator('th').filter({ hasText: /mata kuliah/i });
    const headerAlpha = this.page.locator('th').filter({ hasText: /alpha/i });
    const headerIjin = this.page.locator('th').filter({ hasText: /ijin/i });
    const headerSakit = this.page.locator('th').filter({ hasText: /sakit/i });

    await expect(headerMataKuliah.first()).toBeVisible({ timeout: 10000 });
    await expect(headerAlpha.first()).toBeVisible({ timeout: 10000 });
    await expect(headerIjin.first()).toBeVisible({ timeout: 10000 });
    await expect(headerSakit.first()).toBeVisible({ timeout: 10000 });

    // 3. Verifikasi baris rekapitulasi: Total AIS atau Jumlah
    const rekapRow = this.page.locator('td, th').filter({ hasText: /total ais|jumlah/i });
    await expect(rekapRow.first()).toBeVisible({ timeout: 10000 });
  }
}
