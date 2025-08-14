// Ganti sesuai Supabase project kamu
const SUPABASE_URL = "https://lhwicvwatoiafbtgludo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxod2ljdndhdG9pYWZidGdsdWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNDE0ODQsImV4cCI6MjA3MDYxNzQ4NH0.GAch-_FHbEC7njaMlJizSP0fC_bQLFGooKagxo27N0w";
const BUCKET = "test_crud_test1";

// Supabase client untuk upload file
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const dataList = document.getElementById("dataList");
const addForm = document.getElementById("addForm");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const closeBtn = document.querySelector(".close");

// Modal handling
closeBtn.onclick = function() {
  editModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == editModal) {
    editModal.style.display = "none";
  }
}

// Create data
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value;
  const umur = parseInt(document.getElementById("umur").value);
  const file = document.getElementById("gambar").files[0];
  const filePath = `${Date.now()}_${file.name}`;

  // Upload file ke storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    alert("Upload gagal!");
    console.error(uploadError);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  // Simpan metadata ke tabel versi lama
  // const { error: insertError } = await supabase
  //   .from("test_crud")
  //   .insert([{ nama, umur, gambar_profile: publicUrlData.publicUrl, created_at: new Date() }]);

//   // Simpan metadata ke tabel versi lama sambungan dari line 35
//   if (insertError) {
//     alert("Gagal menyimpan data!");
//     console.error(insertError);
//   } else {
//     addForm.reset();
//   }
// });
// Simpan metadata ke tabel versi baru
      await fetch("/api/insert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    nama,
    umur,
    gambar_profile: publicUrlData.publicUrl,
    created_at: new Date()
  })
});
  addForm.reset();
  loadData();
  });

// Edit form submission
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editId").value;
  const nama = document.getElementById("editNama").value;
  const umur = parseInt(document.getElementById("editUmur").value);
  const file = document.getElementById("editGambar").files[0];
  
  let gambar_profile = document.getElementById("editNama").getAttribute("data-current-image");

  // Jika ada file baru, upload ke storage
  if (file) {
    const filePath = `${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload gambar baru gagal!");
      console.error(uploadError);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);
    
    gambar_profile = publicUrlData.publicUrl;
  }

  try {
    const res = await fetch(`/api/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama,
        umur,
        gambar_profile,
        created_at: new Date().toISOString()
      })
    });

    if (res.ok) {
      alert("Data berhasil diupdate!");
      editModal.style.display = "none";
      editForm.reset();
      loadData();
    } else {
      const errorText = await res.text();
      alert(`Gagal update data: ${errorText}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Function untuk membuka modal edit
async function openEditModal(id) {
  try {
    const res = await fetch(`/api/update/${id}`);
    if (res.ok) {
      const data = await res.json();
      
      document.getElementById("editId").value = data.id;
      document.getElementById("editNama").value = data.nama;
      document.getElementById("editNama").setAttribute("data-current-image", data.gambar_profile);
      document.getElementById("editUmur").value = data.umur;
      
      // Tampilkan gambar saat ini
      const currentImageDiv = document.getElementById("currentImage");
      currentImageDiv.innerHTML = `<img src="${data.gambar_profile}" alt="Current Image">`;
      
      editModal.style.display = "block";
    } else {
      alert("Gagal mengambil data untuk edit");
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Read data realtime
async function loadData() {
  // versi lama
  // const { data, error } = await supabase.from("test_crud").select("*").order("id");
  // if (!error) {
  //   renderData(data);
  // }

  // versi baru
  const res = await fetch("/api/select");
const data = await res.json();
renderData(data);
}

function renderData(rows) {
  dataList.innerHTML = "";
  rows.forEach((row) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${row.gambar_profile}" alt="">
      <div>${row.nama} (${row.umur} th)</div>
      <div>
        <button class="edit-btn" onclick="openEditModal(${row.id})">Edit</button>
        <button class="delete-btn" onclick="deleteData(${row.id})">Hapus</button>
      </div>
    `;
    dataList.appendChild(div);
  });
}

// Delete data
async function deleteData(id) {
  // versi lama
  // const { error } = await supabase.from("test_crud").delete().eq("id", id);
  // if (error) console.error(error);

  // versi baru
  await fetch(`/api/delete/${id}`, { method: "DELETE" });
  loadData();
}

// Realtime listener
supabase.channel("table-db-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "test_crud" }, payload => {
    loadData();
  })
  .subscribe();

// Load awal
loadData();
