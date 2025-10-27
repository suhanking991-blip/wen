const form = document.getElementById("depositForm");
const resultArea = document.getElementById("resultArea");
const tableBody = document.querySelector("#depositsTable tbody");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const amount = document.getElementById("amount").value;
  const note = document.getElementById("note").value;
  const key = document.getElementById("key").value;

  const data = { name, amount, note, key_used: parseInt(key) };

  const res = await fetch("/api/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();

  if (res.ok) {
    resultArea.innerHTML = `
      <div class="box">
        <p><b>Encrypted Amount:</b> ${result.encrypted_amount}</p>
        <p><b>Decrypted Amount:</b> ${result.decrypted_amount}</p>
        <p><b>Encrypted Note:</b> ${result.encrypted_note}</p>
        <p><b>Decrypted Note:</b> ${result.decrypted_note}</p>
      </div>
    `;
    loadDeposits();
  } else {
    alert(result.error);
  }

  form.reset();
  document.getElementById("key").value = key;
});

async function loadDeposits() {
  const res = await fetch("/api/deposits");
  const data = await res.json();

  tableBody.innerHTML = data.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.encrypted_amount}</td>
      <td>${r.decrypted_amount}</td>
      <td>${r.encrypted_note}</td>
      <td>${r.decrypted_note}</td>
      <td>${r.key_used}</td>
      <td>${new Date(r.created_at).toLocaleString()}</td>
    </tr>
  `).join("");
}

loadDeposits();