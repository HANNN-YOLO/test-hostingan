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
export async function onRequestGet(context) {
  // 'env' sekarang ada di dalam 'context'
  const env = context.env;

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud?select=*`, {
    headers: {
      "apikey": env.SUPABASE_SERVICE_ROLE,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`
    }
  });

  // Ambil teks dari respons Supabase
  const data = await res.text();
  
  // Buat respons baru dengan status yang sama dari Supabase
  return new Response(data, { 
    status: res.status,
    headers: {
      // Penting untuk memberitahu browser bahwa ini adalah JSON
      'Content-Type': 'application/json'
    }
  });
}