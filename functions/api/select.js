// File: functions/api/select.js (KODE FINAL YANG PASTI BENAR)

export async function onRequestGet(context) {
  try {
    const { env } = context;

    // Mengambil data dari tabel 'test_crud'
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?select=*`, {
      headers: {
        // HANYA GUNAKAN KUNCI TAMU (ANON_KEY) UNTUK MEMBACA DATA
        'apikey': env.SUPABASE_ANON_KEY
      }
    });

    // Cek jika Supabase mengembalikan eror
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal mengambil data dari Supabase: Status ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Kirim data (yang berupa array) kembali ke front-end
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Jika terjadi eror apapun di dalam blok try, kirim respons 500 dengan pesan yang jelas
    console.error("Error fatal di fungsi select:", error.message);
    return new Response(`Error di server: ${error.message}`, { status: 500 });
  }
}