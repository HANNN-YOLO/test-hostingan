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

// Fungsi untuk menampilkan pesan error
function showError(message) {
  alert(`❌ Error: ${message}`);
}

// Fungsi untuk menampilkan pesan sukses
function showSuccess(message) {
  alert(`✅ ${message}`);
}

// Fungsi validasi input
function validateInput(nama, umur, file) {
  // Validasi nama
  if (!nama || nama.trim().length === 0) {
    throw new Error("Nama tidak boleh kosong");
  }
  if (nama.trim().length < 2) {
    throw new Error("Nama minimal 2 karakter");
  }
  if (nama.trim().length > 50) {
    throw new Error("Nama maksimal 50 karakter");
  }

  // Validasi umur
  if (!umur || isNaN(umur)) {
    throw new Error("Umur harus berupa angka");
  }
  if (umur < 1 || umur > 150) {
    throw new Error("Umur harus antara 1-150 tahun");
  }

  // Validasi file
  if (!file) {
    throw new Error("File gambar harus dipilih");
  }

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("File harus berupa gambar (JPG, PNG, atau GIF)");
  }

  // Validasi ukuran file (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("Ukuran file maksimal 5MB");
  }

  return true;
}

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

  try {
    const nama = document.getElementById("nama").value.trim();
    const umur = parseInt(document.getElementById("umur").value);
    const file = document.getElementById("gambar").files[0];

    // Validasi input
    validateInput(nama, umur, file);

    // Tampilkan loading
    const submitBtn = addForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Menyimpan...";
    submitBtn.disabled = true;

    const filePath = `${Date.now()}_${file.name}`;

    // Upload file ke storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload gagal: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    // Simpan metadata ke tabel
    const response = await fetch("/api/insert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama,
        umur,
        gambar_profile: publicUrlData.publicUrl,
        created_at: new Date()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gagal menyimpan data: ${errorText}`);
    }

    showSuccess("Data berhasil ditambahkan!");
    addForm.reset();
    loadData();

  } catch (error) {
    showError(error.message);
    console.error("Error saat menambah data:", error);
  } finally {
    // Reset button
    const submitBtn = addForm.querySelector('button[type="submit"]');
    submitBtn.textContent = "Tambah";
    submitBtn.disabled = false;
  }
});

// Edit form submission
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const id = document.getElementById("editId").value;
    const nama = document.getElementById("editNama").value.trim();
    const umur = parseInt(document.getElementById("editUmur").value);
    const file = document.getElementById("editGambar").files[0];
    
    let gambar_profile = document.getElementById("editNama").getAttribute("data-current-image");

    // Validasi input (file optional untuk edit)
    if (!nama || nama.trim().length === 0) {
      throw new Error("Nama tidak boleh kosong");
    }
    if (nama.trim().length < 2) {
      throw new Error("Nama minimal 2 karakter");
    }
    if (nama.trim().length > 50) {
      throw new Error("Nama maksimal 50 karakter");
    }
    if (!umur || isNaN(umur)) {
      throw new Error("Umur harus berupa angka");
    }
    if (umur < 1 || umur > 150) {
      throw new Error("Umur harus antara 1-150 tahun");
    }

    // Tampilkan loading
    const submitBtn = editForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Menyimpan...";
    submitBtn.disabled = true;

    // Jika ada file baru, upload ke storage
    if (file) {
      // Validasi file baru
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("File harus berupa gambar (JPG, PNG, atau GIF)");
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("Ukuran file maksimal 5MB");
      }

      const filePath = `${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload gambar baru gagal: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);
      
      gambar_profile = publicUrlData.publicUrl;
    }

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
      showSuccess("Data berhasil diupdate!");
      editModal.style.display = "none";
      editForm.reset();
      loadData();
    } else {
      const errorText = await res.text();
      throw new Error(`Gagal update data: ${errorText}`);
    }
  } catch (error) {
    showError(error.message);
    console.error("Error saat update data:", error);
  } finally {
    // Reset button
    const submitBtn = editForm.querySelector('button[type="submit"]');
    submitBtn.textContent = "Update";
    submitBtn.disabled = false;
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
      const errorText = await res.text();
      throw new Error(`Gagal mengambil data untuk edit: ${errorText}`);
    }
  } catch (error) {
    showError(error.message);
    console.error("Error saat membuka modal edit:", error);
  }
}

// Read data realtime
async function loadData() {
  try {
    const res = await fetch("/api/select");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!Array.isArray(data)) {
      throw new Error("Data yang diterima bukan array");
    }
    
    renderData(data);
  } catch (error) {
    showError(`Gagal memuat data: ${error.message}`);
    console.error("Error saat memuat data:", error);
    // Tampilkan pesan error di UI
    dataList.innerHTML = `<div class="error-message">❌ Gagal memuat data: ${error.message}</div>`;
  }
}

function renderData(rows) {
  if (!rows || rows.length === 0) {
    dataList.innerHTML = '<div class="no-data">📝 Belum ada data yang tersimpan</div>';
    return;
  }

  dataList.innerHTML = "";
  rows.forEach((row) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${row.gambar_profile || 'placeholder-image.jpg'}" alt="Profile" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCAyNUMyOC4wNyAyNSAxMCA0My4wNyAxMCA2NUMxMCA4Ni45MyAyOC4wNyAxMDUgNTAgMTA1QzcxLjkzIDEwNSA5MCA4Ni45MyA5MCA2NUM5MCA0My4wNyA3MS45MyAyNSA1MCAyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'">
      <div>${row.nama || 'Nama tidak tersedia'} (${row.umur || 'Umur tidak tersedia'} th)</div>
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
  try {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      return;
    }

    const res = await fetch(`/api/delete/${id}`, { method: "DELETE" });
    
    if (res.ok) {
      showSuccess("Data berhasil dihapus!");
      loadData();
    } else {
      const errorText = await res.text();
      throw new Error(`Gagal menghapus data: ${errorText}`);
    }
  } catch (error) {
    showError(error.message);
    console.error("Error saat menghapus data:", error);
  }
}

// Realtime listener dengan error handling
try {
  supabase.channel("table-db-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "test_crud" }, payload => {
      loadData();
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Realtime connection established');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Realtime connection error');
        showError("Koneksi realtime terputus");
      }
    });
} catch (error) {
  console.error("Error setting up realtime listener:", error);
  showError("Gagal mengatur koneksi realtime");
}

// Load awal
loadData();
