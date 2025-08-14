// File: functions/api/update/[id].js

// Fungsi ini akan otomatis dipanggil untuk request PUT ke /api/update/:id
export async function onRequestPut(context) {
  try {
    // Ambil environment variables dan parameter dari context
    const { env, params, request } = context;

    // Validasi method request
    if (request.method !== 'PUT') {
      return new Response(JSON.stringify({
        error: "Method tidak diizinkan",
        message: "Hanya method PUT yang diizinkan untuk endpoint ini"
      }), { 
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validasi environment variables
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE) {
      return new Response(JSON.stringify({
        error: "Konfigurasi server tidak lengkap",
        message: "SUPABASE_URL atau SUPABASE_SERVICE_ROLE tidak ditemukan"
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Ambil 'id' dari URL (misal: /api/update/123 -> id = "123")
    const id = params.id;

    // Validasi ID
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return new Response(JSON.stringify({
        error: "ID tidak valid",
        message: "ID harus berupa angka positif"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse body request
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return new Response(JSON.stringify({
        error: "Format data tidak valid",
        message: "Body request harus berupa JSON yang valid"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!body) {
      return new Response(JSON.stringify({
        error: "Data tidak boleh kosong",
        message: "Body request tidak boleh kosong"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { nama, umur, gambar_profile, created_at } = body;

    // Validasi data yang diperlukan
    if (!nama || typeof nama !== 'string' || nama.trim().length === 0) {
      return new Response(JSON.stringify({
        error: "Nama tidak valid",
        message: "Nama harus diisi dan berupa teks"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (nama.trim().length < 2) {
      return new Response(JSON.stringify({
        error: "Nama terlalu pendek",
        message: "Nama minimal 2 karakter"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (nama.trim().length > 50) {
      return new Response(JSON.stringify({
        error: "Nama terlalu panjang",
        message: "Nama maksimal 50 karakter"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!umur || isNaN(umur) || !Number.isInteger(Number(umur))) {
      return new Response(JSON.stringify({
        error: "Umur tidak valid",
        message: "Umur harus berupa angka bulat"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (Number(umur) < 1 || Number(umur) > 150) {
      return new Response(JSON.stringify({
        error: "Umur tidak valid",
        message: "Umur harus antara 1-150 tahun"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validasi gambar_profile (opsional untuk update)
    if (gambar_profile && typeof gambar_profile !== 'string') {
      return new Response(JSON.stringify({
        error: "URL gambar tidak valid",
        message: "URL gambar profile harus berupa string"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validasi URL gambar jika ada
    if (gambar_profile) {
      try {
        new URL(gambar_profile);
      } catch (urlError) {
        return new Response(JSON.stringify({
          error: "URL gambar tidak valid",
          message: "Format URL gambar tidak valid"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Validasi created_at (opsional)
    let validatedCreatedAt = new Date().toISOString();
    if (created_at) {
      const date = new Date(created_at);
      if (isNaN(date.getTime())) {
        return new Response(JSON.stringify({
          error: "Tanggal tidak valid",
          message: "Format tanggal created_at tidak valid"
        }), { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      validatedCreatedAt = date.toISOString();
    }

    // Siapkan data untuk update
    const updateData = {
      nama: nama.trim(),
      umur: Number(umur),
      updated_at: new Date().toISOString()
    };

    // Tambahkan field opsional jika ada
    if (gambar_profile) {
      updateData.gambar_profile = gambar_profile;
    }
    if (created_at) {
      updateData.created_at = validatedCreatedAt;
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
      body: JSON.stringify(updateData)
    });

    // Handle response dari Supabase
    if (!res.ok) {
      let errorMessage = "Gagal mengupdate data di database";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        const errorText = await res.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }

      return new Response(JSON.stringify({
        error: "Database error",
        message: errorMessage,
        status: res.status
      }), { 
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Jika Supabase mengembalikan status 204 (No Content), berarti berhasil
    if (res.status === 204) {
      return new Response(JSON.stringify({
        success: true,
        message: `Data dengan ID ${id} berhasil diupdate.`
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Jika ada response body, kembalikan
    try {
      const responseData = await res.json();
      return new Response(JSON.stringify({
        success: true,
        message: `Data dengan ID ${id} berhasil diupdate.`,
        data: responseData
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (parseError) {
      return new Response(JSON.stringify({
        success: true,
        message: `Data dengan ID ${id} berhasil diupdate.`
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("Error dalam update API:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: "Terjadi kesalahan internal server saat mengupdate data",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Tambahkan handler untuk GET request untuk mengambil data berdasarkan ID
export async function onRequestGet(context) {
  try {
    const { env, params, request } = context;

    // Validasi method request
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({
        error: "Method tidak diizinkan",
        message: "Hanya method GET yang diizinkan untuk endpoint ini"
      }), { 
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validasi environment variables
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE) {
      return new Response(JSON.stringify({
        error: "Konfigurasi server tidak lengkap",
        message: "SUPABASE_URL atau SUPABASE_SERVICE_ROLE tidak ditemukan"
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const id = params.id;

    // Validasi ID
    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return new Response(JSON.stringify({
        error: "ID tidak valid",
        message: "ID harus berupa angka positif"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Ambil data berdasarkan ID dari Supabase
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?id=eq.${id}&select=*`, {
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
      }
    });

    // Handle response dari Supabase
    if (!res.ok) {
      let errorMessage = "Gagal mengambil data dari database";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        const errorText = await res.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }

      return new Response(JSON.stringify({
        error: "Database error",
        message: errorMessage,
        status: res.status
      }), { 
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (res.status === 200) {
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        return new Response(JSON.stringify({
          error: "Format data tidak valid",
          message: "Data yang diterima dari database tidak dalam format yang valid"
        }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      if (data && data.length > 0) {
        return new Response(JSON.stringify(data[0]), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        });
      } else {
        return new Response(JSON.stringify({
          error: "Data tidak ditemukan",
          message: `Data dengan ID ${id} tidak ditemukan dalam database`
        }), { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const errorData = await res.text();
    return new Response(JSON.stringify({
      error: "Unexpected response",
      message: "Response tidak terduga dari database"
    }), { 
      status: res.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error dalam get by ID API:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: "Terjadi kesalahan internal server saat mengambil data",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
