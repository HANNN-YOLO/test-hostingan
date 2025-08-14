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

    // Ambil body dari request yang dikirim oleh frontend
    const body = await request.json();

    // Lakukan request ke Supabase untuk memasukkan data baru
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/test_crud`, {
      method: "POST",
      headers: {
        "apikey": env.SUPABASE_SERVICE_ROLE,
        "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation" // Minta Supabase mengembalikan data yg baru dibuat
      },
      body: JSON.stringify(body)
    });

    // Ambil data respons dari Supabase
    const data = await res.text();

    // Kirim kembali respons ke frontend
    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    return new Response(`Gagal memasukkan data: ${error.message}`, { status: 500 });
  }
}