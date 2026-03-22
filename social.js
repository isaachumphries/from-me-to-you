import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

onAuthStateChanged(auth, user => {
  if (!user) return (window.location.href = "index.html");
  loadCategories();
});

document.getElementById("openMakeCat").addEventListener("click", () => {
  document.getElementById("make-cat").style.display = "block";
});

document.getElementById("cancelCatBtn").addEventListener("click", () => {
  document.getElementById("make-cat").style.display = "none";
});

document.getElementById("createCatBtn").addEventListener("click", async () => {
  const name = document.getElementById("catInput").value.trim();
  const desc = document.getElementById("catDesc").value.trim();
  if (!name || !desc) return;

  const user = auth.currentUser;

  const docRef = await addDoc(collection(db, "categories"), {
    name,
    description: desc,
    createdBy: user.uid,
    createdByName: user.username || user.email.split("@")[0], // fallback to email prefix if username not set
    createdAt: serverTimestamp()
  });

  document.getElementById("catInput").value = "";
  document.getElementById("catDesc").value = "";
  document.getElementById("make-cat").style.display = "none";

  window.location.href = `category.html?id=${docRef.id}`;
});

async function loadCategories() {
  const snap = await getDocs(collection(db, "categories"));
  const catBrowse = document.getElementById("catBrowse");

  if (snap.empty) {
    catBrowse.innerHTML = "<p>No categories yet, be the first one!</p>";
    return;
  }

  catBrowse.innerHTML = snap.docs.map(d => {
  const data = d.data();
  return `
    <div class="category-card" data-id="${d.id}">
      <h3>${data.name}</h3>
      <p>${data.description || ""}</p>
      <small>Created by ${data.createdByName || "someone"}</small>
    </div>
  `;
}).join('');

// attach listeners after rendering
document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", () => {
    window.location.href = `category.html?id=${card.dataset.id}`;
  });
});}
