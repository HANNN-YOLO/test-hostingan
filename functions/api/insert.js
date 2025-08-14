// // File: /functions/api/insert.js
// export async function onRequestPost(context) {
//   // Letakkan logika untuk memasukkan data ke Supabase di sini.
//   console.log("Endpoint /api/insert diakses");
//   // ...kode insert ke Supabase...
//   return new Response(JSON.stringify({ message: "Data berhasil dimasukkan" }));
// }

// File: functions/api/insert.js

// Fungsi ini akan otomatis dipanggil untuk request POST ke /api/insert
export async function onRequestPost(context) {
  try {
    // Ambil request dan environment variables dari context
    const { request, env } = context;

    // Validasi method request
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({
        error: "Method tidak diizinkan",
        message: "Hanya method POST yang diizinkan untuk endpoint ini"
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

    // Ambil body dari request yang dikirim oleh frontend
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

    // Validasi data yang diperlukan
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

    // Validasi nama
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

    // Validasi umur
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

    // Validasi gambar_profile
    if (!gambar_profile || typeof gambar_profile !== 'string') {
      return new Response(JSON.stringify({
        error: "URL gambar tidak valid",
        message: "URL gambar profile harus diisi"
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validasi URL gambar
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

    // Siapkan data untuk insert
    const insertData = {
      nama: nama.trim(),
      umur: Number(umur),
      gambar_profile: gambar_profile,
      created_at: validatedCreatedAt
    };

    // Lakukan request ke Supabase untuk memasukkan data baru
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation" // Minta Supabase mengembalikan data yg baru dibuat
      },
      body: JSON.stringify(insertData)
    });

    // Handle response dari Supabase
    if (!res.ok) {
      let errorMessage = "Gagal memasukkan data ke database";
      
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

    // Ambil data respons dari Supabase
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      data = await res.text();
    }

    // Kirim kembali respons sukses ke frontend
    return new Response(JSON.stringify({
      success: true,
      message: "Data berhasil ditambahkan",
      data: data
    }), {
      status: 201,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error dalam insert API:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: "Terjadi kesalahan internal server",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}