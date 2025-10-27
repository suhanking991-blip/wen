const apiURL = "http://localhost:5000/api/deposits";

// Fungsi enkripsi sederhana (Transposisi)
function encrypt(text, key) {
  let encrypted = "";
  for (let i = 0; i < key; i++) {
    for (let j = i; j < text.length; j += key) {
      encrypted += text[j];
    }
  }
  return encrypted;
}

// Fungsi dekripsi sederhana
function decrypt(cipher, key) {
  const n = Math.ceil(cipher.length / key);
  let matrix = Array.from({ length: n }, () => "");
  let idx = 0;
  for (let i = 0; i < key; i++) {
    for (let j = 0; j < n; j++) {
      if (idx < cipher.length) matrix[j] += cipher[idx++];
    }
  }
  return matrix.join("");
}

// Handle form submit
document.getElementById("depositForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const amount = document.getElementById("amount").value.trim();
  const note = document.getElementById("note").value.trim();
  const key = parseInt(document.getElementById("key").value);
  const date = new Date().toLocaleString();

  // Enkripsi & dekripsi
  const encryptedAmount = encrypt(amount, key);
  const decryptedAmount = decrypt(encryptedAmount, key);
  const encryptedNote = encrypt(note, key);
  const decryptedNote = decrypt(encryptedNote, key);

  // Tampilkan hasil
  document.getElementById("resultArea").innerHTML = `
    <b>Encrypted:</b> ${encryptedAmount} <br>
    <b>Decrypted:</b> ${decryptedAmount}
  `;

  // Simpan ke server
  await fetch(apiURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      encryptedAmount,
      decryptedAmount,
      encryptedNote,
      decryptedNote,
      keyUsed: key,
      date,
    }),
  });

  e.target.reset();
  loadDeposits();
});

// Load semua data dari server
async function loadDeposits() {
  const res = await fetch(apiURL);
  const data = await res.json();

  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = "";

  data.forEach((d) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.id}</td>
      <td>${d.name}</td>
      <td>${d.encryptedAmount}</td>
      <td>${d.decryptedAmount}</td>
      <td>${d.encryptedNote}</td>
      <td>${d.decryptedNote}</td>
      <td>${d.keyUsed}</td>
      <td>${d.date}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteDeposit(${d.id})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Hapus data
async function deleteDeposit(id) {
  if (!confirm("Yakin ingin menghapus data ini?")) return;
  await fetch(`${apiURL}/${id}`, { method: "DELETE" });
  loadDeposits();
}

// Saat halaman dibuka, load data
loadDeposits();
