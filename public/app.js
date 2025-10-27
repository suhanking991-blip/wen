const form = document.getElementById('depositForm');
const tbody = document.querySelector('tbody');
const resultArea = document.getElementById('resultArea');

// Fungsi enkripsi sederhana
function encrypt(text, key) {
  let encrypted = '';
  for (let i = 0; i < key; i++) {
    for (let j = i; j < text.length; j += key) {
      encrypted += text[j];
    }
  }
  return encrypted;
}

// Fungsi deskripsi sederhana
function decrypt(text, key) {
  const numRows = Math.ceil(text.length / key);
  let decrypted = Array(text.length).fill('');
  let index = 0;

  for (let i = 0; i < key; i++) {
    for (let j = i; j < text.length; j += key) {
      decrypted[j] = text[index++];
    }
  }
  return decrypted.join('');
}

// Load semua data dari database
async function loadData() {
  const res = await fetch("/api/deposits");
  const data = await res.json();
  tbody.innerHTML = "";
  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.encryptedAmount}</td>
      <td>${item.decryptedAmount}</td>
      <td>${item.encryptedNote}</td>
      <td>${item.decryptedNote}</td>
      <td>${item.keyUsed}</td>
      <td>${item.date}</td>
      <td><button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}">Hapus</button></td>
    `;
    tbody.appendChild(row);
  });
}

// Kirim data baru
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;
  const key = parseInt(document.getElementById("key").value);

  const encryptedAmount = encrypt(amount, key);
  const decryptedAmount = decrypt(encryptedAmount, key);
  const encryptedNote = encrypt(note, key);
  const decryptedNote = decrypt(encryptedNote, key);
  const now = new Date().toLocaleString("id-ID");

  resultArea.innerHTML = `
    <p><b>Encrypted Amount:</b> ${encryptedAmount}</p>
    <p><b>Decrypted Amount:</b> ${decryptedAmount}</p>
    <p><b>Encrypted Note:</b> ${encryptedNote}</p>
    <p><b>Decrypted Note:</b> ${decryptedNote}</p>
  `;

  await fetch("/api/deposits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      encryptedAmount,
      decryptedAmount,
      encryptedNote,
      decryptedNote,
      keyUsed: key,
      date: now
    }),
  });

  loadData();
  form.reset();
});

// Hapus data
tbody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;
    await fetch(`/api/deposits/${id}`, { method: "DELETE" });
    loadData();
  }
});

// Saat halaman dibuka, langsung load data
loadData();
