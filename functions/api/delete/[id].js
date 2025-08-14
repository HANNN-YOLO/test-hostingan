// File: functions/api/delete/[id].js

// Fungsi ini akan otomatis dipanggil untuk request DELETE ke /api/delete/:id
export async function onRequestDelete(context) {
  try {
    // Ambil environment variables dan parameter dari context
    const { env, params } = context;

    // Ambil 'id' dari URL (misal: /api/delete/123 -> id = "123")
    const id = params.id;

    // Lakukan request ke Supabase untuk menghapus data berdasarkan ID
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
      }
    });

    // Jika Supabase mengembalikan status 204 (No Content), berarti berhasil
    if (res.status === 204) {
        return new Response(`Data dengan ID ${id} berhasil dihapus.`, { status: 200 });
    }

    // Jika ada error lain dari Supabase
    const errorData = await res.text();
    return new Response(errorData, { status: res.status });

  } catch (error) {
    return new Response(`Gagal menghapus data: ${error.message}`, { status: 500 });
  }
}