// // File: /functions/api/select.js
// export async function onRequestGet(context) {
//   // 'context' berisi environment variables (env), request, dll.
//   // Letakkan logika untuk mengambil data dari Supabase di sini.
//   console.log("Endpoint /api/select diakses");
//   // ...kode fetch ke Supabase...
//   return new Response(JSON.stringify({ message: "Data berhasil diambil" }));
// }

// File: functions/api/select.js

// Cloudflare akan otomatis memanggil fungsi ini untuk request GET /api/select
// export async function onRequestGet(context) {
//   try {
//     // Ambil environment variables dari context
//     const { env, request } = context;

//     // Validasi method request
//     if (request.method !== 'GET') {
//       return new Response(JSON.stringify({
//         error: "Method tidak diizinkan",
//         message: "Hanya method GET yang diizinkan untuk endpoint ini"
//       }), { 
//         status: 405,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     // Validasi environment variables
//     if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE) {
//       return new Response(JSON.stringify({
//         error: "Konfigurasi server tidak lengkap",
//         message: "SUPABASE_URL atau SUPABASE_SERVICE_ROLE tidak ditemukan"
//       }), { 
//         status: 500,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     // Lakukan request ke Supabase untuk mengambil data
//     const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?select=*&order=id.desc`, {
//       headers: {
//         "apikey": env.SUPABASE_SERVICE_ROLE,
//         "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
//       }
//     });

//     // Handle response dari Supabase
//     if (!res.ok) {
//       let errorMessage = "Gagal mengambil data dari database";
      
//       try {
//         const errorData = await res.json();
//         errorMessage = errorData.message || errorData.error || errorMessage;
//       } catch (parseError) {
//         const errorText = await res.text();
//         if (errorText) {
//           errorMessage = errorText;
//         }
//       }

//       return new Response(JSON.stringify({
//         error: "Database error",
//         message: errorMessage,
//         status: res.status
//       }), { 
//         status: res.status,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     // Ambil data dari respons Supabase
//     let data;
//     try {
//       data = await res.json();
//     } catch (parseError) {
//       // Jika gagal parse JSON, coba ambil sebagai text
//       const textData = await res.text();
//       try {
//         data = JSON.parse(textData);
//       } catch (secondParseError) {
//         return new Response(JSON.stringify({
//           error: "Format data tidak valid",
//           message: "Data yang diterima dari database tidak dalam format yang valid"
//         }), { 
//           status: 500,
//           headers: { "Content-Type": "application/json" }
//         });
//       }
//     }

//     // Validasi data yang diterima
//     if (!Array.isArray(data)) {
//       return new Response(JSON.stringify({
//         error: "Format data tidak valid",
//         message: "Data yang diterima bukan dalam format array"
//       }), { 
//         status: 500,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     // Filter dan validasi setiap item data
//     const validatedData = data.filter(item => {
//       return item && 
//              typeof item === 'object' && 
//              item.id !== undefined && 
//              item.nama !== undefined && 
//              item.umur !== undefined;
//     }).map(item => ({
//       id: item.id,
//       nama: item.nama || 'Nama tidak tersedia',
//       umur: item.umur || 'Umur tidak tersedia',
//       gambar_profile: item.gambar_profile || null,
//       created_at: item.created_at || null
//     }));

//     // Kirim respons sukses ke frontend
//     return new Response(JSON.stringify(validatedData), { 
//       status: 200,
//       headers: {
//         'Content-Type': 'application/json',
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0'
//       }
//     });

//   } catch (error) {
//     console.error("Error dalam select API:", error);
    
//     return new Response(JSON.stringify({
//       error: "Internal server error",
//       message: "Terjadi kesalahan internal server saat mengambil data",
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     }), { 
//       status: 500,
//       headers: { "Content-Type": "application/json" }
//     });
//   }
// }

// Kode ini hanya untuk debugging, untuk melihat environment variables
export async function onRequestGet(context) {
  try {
    const { env } = context;

    // Mengubah objek 'env' menjadi string JSON yang mudah dibaca
    const envDebugString = JSON.stringify(env, null, 2);

    // Tampilkan di Log Cloudflare untuk kita lihat nanti
    console.log("Variabel Lingkungan yang Terdeteksi di Server:");
    console.log(envDebugString);

    // Kirim semua variabel sebagai respons untuk dilihat langsung di browser
    return new Response(envDebugString, {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(`Error saat debugging: ${error.message}`, { status: 500 });
  }
}