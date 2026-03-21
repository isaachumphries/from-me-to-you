import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  doc, getDoc, collection, addDoc, getDocs,
  updateDoc, increment, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const categoryId = params.get("id");

if (!categoryId) {
  window.location.href = "social.html";
  throw new Error("No category ID"); 
}

const sections = ["Notes", "Wins", "Advice"];

sections.forEach(name => {
  document.getElementById(`tab${name}`).addEventListener("click", () => {
    sections.forEach(s => {
      document.getElementById(`section${s}`).style.display = s === name ? "block" : "none";
      document.getElementById(`tab${s}`).classList.toggle("active", s === name);
    });
  });
});

async function loadCategory() {
  const snap = await getDoc(doc(db, "categories", categoryId));
  if (!snap.exists()) return (window.location.href = "social.html");
  const data = snap.data();
  document.getElementById("catName").textContent = data.name;
  document.getElementById("catDesc").textContent = data.description || "";
  document.getElementById("catCreator").textContent = `Created by ${data.createdByName || "someone"}`;
}

async function loadNotes() {
  const snap = await getDocs(collection(db, "categories", categoryId, "notes"));
  const feed = document.getElementById("notesFeed");
  if (snap.empty) { feed.innerHTML = "<p>No notes yet — be the first!</p>"; return; }
  feed.innerHTML = snap.docs.map(d => {
    const data = d.data();
    if (data.dislikes - data.likes >= 10) return ""; // hidden
    return `
      <div class="post-card">
        <p>${data.text}</p>
        <div class="post-footer">
          <small>${data.authorName || "anonymous"}</small>
          <div class="post-actions">
            <button onclick="likePost('notes', '${d.id}', this)">♡ ${data.likes || 0}</button>
            <button onclick="dislikePost('notes', '${d.id}', this)">👎</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById("postNoteBtn").addEventListener("click", async () => {
  const text = document.getElementById("noteInput").value.trim();
  if (!text) return;
  await addDoc(collection(db, "categories", categoryId, "notes"), {
    text,
    authorId: auth.currentUser.uid,
    authorName: auth.currentUser.displayName || auth.currentUser.email,
    likes: 0,
    dislikes: 0,
    createdAt: serverTimestamp()
  });
  document.getElementById("noteInput").value = "";
  loadNotes();
});

// ─── Wins ────────────────────────────────────────────────────

async function loadWins() {
  const snap = await getDocs(collection(db, "categories", categoryId, "wins"));
  const feed = document.getElementById("winsFeed");
  if (snap.empty) { feed.innerHTML = "<p>No wins yet — share yours!</p>"; return; }
  feed.innerHTML = snap.docs.map(d => {
    const data = d.data();
    return `
      <div class="post-card win-card">
        <p>${data.text}</p>
        <div class="post-footer">
          <small>${data.authorName || "anonymous"}</small>
          <div class="post-actions">
            <button onclick="likePost('wins', '${d.id}', this)">👍 ${data.likes || 0}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById("postWinBtn").addEventListener("click", async () => {
  const text = document.getElementById("winInput").value.trim();
  if (!text) return;
  await addDoc(collection(db, "categories", categoryId, "wins"), {
    text,
    authorId: auth.currentUser.uid,
    authorName: auth.currentUser.displayName || auth.currentUser.email,
    likes: 0,
    createdAt: serverTimestamp()
  });
  document.getElementById("winInput").value = "";
  loadWins();
});

// ─── Advice ──────────────────────────────────────────────────

const crisisWords = ["suicide", "end my life", "can't go on", "kill myself", "no reason to live"];

document.getElementById("adviceInput").addEventListener("input", () => {
  const text = document.getElementById("adviceInput").value.toLowerCase();
  const isCrisis = crisisWords.some(w => text.includes(w));
  document.getElementById("crisisBox").style.display = isCrisis ? "block" : "none";
});

async function loadAdvice() {
  const snap = await getDocs(collection(db, "categories", categoryId, "advice"));
  const feed = document.getElementById("adviceFeed");
  if (snap.empty) { feed.innerHTML = "<p>No advice yet — share what you know!</p>"; return; }
  feed.innerHTML = snap.docs.map(d => {
    const data = d.data();
    return `
      <div class="post-card advice-card">
        <h3>${data.title}</h3>
        <p>${data.text}</p>
        <div class="post-footer">
          <small>${data.authorName || "anonymous"}</small>
          <div class="post-actions">
            <button onclick="likePost('advice', '${d.id}', this)">👍 ${data.likes || 0}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById("postAdviceBtn").addEventListener("click", async () => {
  const title = document.getElementById("adviceTitleInput").value.trim();
  const text = document.getElementById("adviceInput").value.trim();
  if (!title || !text) return;
  const isCrisis = crisisWords.some(w => text.toLowerCase().includes(w));
  if (isCrisis) return; // don't post, crisis box is already showing
  await addDoc(collection(db, "categories", categoryId, "advice"), {
    title,
    text,
    authorId: auth.currentUser.uid,
    authorName: auth.currentUser.displayName || auth.currentUser.email,
    likes: 0,
    createdAt: serverTimestamp()
  });
  document.getElementById("adviceTitleInput").value = "";
  document.getElementById("adviceInput").value = "";
  loadAdvice();
});

// ─── Likes / Dislikes ─────────────────────────────────────────

window.likePost = async (subcollection, postId, btn) => {
  await updateDoc(doc(db, "categories", categoryId, subcollection, postId), {
    likes: increment(1)
  });
  const current = parseInt(btn.textContent.match(/\d+/)?.[0] || 0);
  btn.textContent = `👍 ${current + 1}`;
};

window.dislikePost = async (subcollection, postId, btn) => {
  await updateDoc(doc(db, "categories", categoryId, subcollection, postId), {
    dislikes: increment(1)
  });
  // reload to check if post should now be hidden
  if (subcollection === "notes") loadNotes();
};

// ─── Init ─────────────────────────────────────────────────────

onAuthStateChanged(auth, user => {
  if (!user) return (window.location.href = "index.html");
  loadCategory();
  loadNotes();
});
