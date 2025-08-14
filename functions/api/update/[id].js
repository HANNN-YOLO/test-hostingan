// File: functions/api/update/[id].js

// Fungsi ini akan otomatis dipanggil untuk request PUT ke /api/update/:id
export async function onRequestPut(context) {
  try {
    // Ambil environment variables dan parameter dari context
    const { env, params, request } = context;

    // Ambil 'id' dari URL (misal: /api/update/123 -> id = "123")
    const id = params.id;

    // Parse body request
    const body = await request.json();
    const { nama, umur, gambar_profile, created_at } = body;

    // Validasi data yang diperlukan
    if (!nama || !umur) {
      return new Response("Nama dan umur harus diisi", { status: 400 });
    }

    // Lakukan request ke Supabase untuk update data berdasarkan ID
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        nama,
        umur: parseInt(umur),
        gambar_profile,
        created_at: created_at || new Date().toISOString()
      })
    });

    // Jika Supabase mengembalikan status 204 (No Content), berarti berhasil
    if (res.status === 204) {
      return new Response(`Data dengan ID ${id} berhasil diupdate.`, { status: 200 });
    }

    // Jika ada error lain dari Supabase
    const errorData = await res.text();
    return new Response(errorData, { status: res.status });

  } catch (error) {
    return new Response(`Gagal update data: ${error.message}`, { status: 500 });
  }
}

// Tambahkan handler untuk GET request untuk mengambil data berdasarkan ID
export async function onRequestGet(context) {
  try {
    const { env, params } = context;
    const id = params.id;

    // Ambil data berdasarkan ID dari Supabase
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?id=eq.${id}&select=*`, {
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
      }
    });

    if (res.status === 200) {
      const data = await res.json();
      if (data && data.length > 0) {
        return new Response(JSON.stringify(data[0]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        return new Response("Data tidak ditemukan", { status: 404 });
      }
    }

    const errorData = await res.text();
    return new Response(errorData, { status: res.status });

  } catch (error) {
    return new Response(`Gagal mengambil data: ${error.message}`, { status: 500 });
  }
}
