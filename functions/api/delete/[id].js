// File: functions/api/delete/[id].js

// Fungsi ini akan otomatis dipanggil untuk request DELETE ke /api/delete/:id
export async function onRequestDelete(context) {
  try {
    // Ambil environment variables dan parameter dari context
    const { env, params, request } = context;

    // Validasi method request
    if (request.method !== 'DELETE') {
      return new Response(JSON.stringify({
        error: "Method tidak diizinkan",
        message: "Hanya method DELETE yang diizinkan untuk endpoint ini"
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

    // Ambil 'id' dari URL (misal: /api/delete/123 -> id = "123")
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

    // Cek apakah data dengan ID tersebut ada sebelum dihapus
    const checkRes = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?id=eq.${id}&select=id`, {
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
      }
    });

    if (!checkRes.ok) {
      let errorMessage = "Gagal memeriksa keberadaan data";
      
      try {
        const errorData = await checkRes.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        const errorText = await checkRes.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }

      return new Response(JSON.stringify({
        error: "Database error",
        message: errorMessage,
        status: checkRes.status
      }), { 
        status: checkRes.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Cek apakah data ada
    let existingData;
    try {
      existingData = await checkRes.json();
    } catch (parseError) {
      return new Response(JSON.stringify({
        error: "Format data tidak valid",
        message: "Gagal memeriksa keberadaan data"
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!existingData || existingData.length === 0) {
      return new Response(JSON.stringify({
        error: "Data tidak ditemukan",
        message: `Data dengan ID ${id} tidak ditemukan dalam database`
      }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Lakukan request ke Supabase untuk menghapus data berdasarkan ID
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
      }
    });

    // Handle response dari Supabase
    if (!res.ok) {
      let errorMessage = "Gagal menghapus data dari database";
      
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
        message: `Data dengan ID ${id} berhasil dihapus.`
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
        message: `Data dengan ID ${id} berhasil dihapus.`,
        data: responseData
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (parseError) {
      return new Response(JSON.stringify({
        success: true,
        message: `Data dengan ID ${id} berhasil dihapus.`
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("Error dalam delete API:", error);
    
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: "Terjadi kesalahan internal server saat menghapus data",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}