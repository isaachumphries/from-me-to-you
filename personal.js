import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const countDisplay = document.getElementById("count");
const incBtn = document.getElementById("incBtn");
const letterText = document.getElementById("letterText");
const daysUntil = document.getElementById("daysUntil");
const sendLetterBtn = document.getElementById("sendLetterBtn");
const letterStatus = document.getElementById("letterStatus");
const envelopesDiv = document.getElementById("envelopes");
const popup = document.getElementById("letterPopup");
const popupText = document.getElementById("popupText");
const popupSave = document.getElementById("popupSave");
const popupClose = document.getElementById("popupClose");

const MS_PER_DAY = 86400000;

const isToday = (timestamp) => new Date(timestamp).toDateString() === new Date().toDateString();

const disableBtn = () => {
  incBtn.disabled = true;
  Object.assign(incBtn.style, { opacity: "0.4", cursor: "not-allowed" });
  incBtn.textContent = "You're Checked In!";
};

// check in
async function loadCount(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data() || {};
  
  countDisplay.textContent = data.count || 0;
  if (data.lastCheckIn && isToday(data.lastCheckIn)) disableBtn();
}

async function handleCheckIn(user) {
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data() || {};
  if (data.lastCheckIn && isToday(data.lastCheckIn)) { disableBtn(); return; }

  await setDoc(doc(db, "users", user.uid), {
    count: increment(1),
    lastCheckIn: Date.now()
  }, { merge: true });

  countDisplay.textContent = parseInt(countDisplay.textContent || 0) + 1;
  disableBtn();
}

async function sendLetter(user) {
  const text = letterText.value.trim();
  const days = parseInt(daysUntil.value);

  if (!text || days < 1) return (letterStatus.textContent = "Write text and choose 1+ days!");

  await addDoc(collection(db, "users", user.uid, "letters"), {
    text,
    openDate: Date.now() + (days * MS_PER_DAY),
    createdAt: Date.now(),
    opened: false
  });

  letterText.value = "";
  daysUntil.value = 30;
  letterStatus.textContent = "Letter sealed!";
  setTimeout(() => letterStatus.textContent = "", 3000);

  loadLetters(user);
}

async function loadLetters(user) {
  const snap = await getDocs(collection(db, "users", user.uid, "letters"));
  const now = Date.now();
  
 const letters = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

 const pending = letters
    .filter(l => l.openDate > now && !l.opened)
    .map(l => ({ ...l, daysLeft: Math.ceil((l.openDate - now) / MS_PER_DAY) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  envelopesDiv.innerHTML = pending.map(l => `
    <div class="envelope">
      <span class="envelope-icon">✉️</span>
      <span class="envelope-days">${l.daysLeft} day${l.daysLeft !== 1 ? "s" : ""} left</span>
    </div>
  `).join('');

  const saved = letters.filter(l => l.saved);
  const savedDiv = document.getElementById("saved-letters");
  savedDiv.innerHTML = saved.length ? `
    <h3>Saved Letters</h3>
    ${saved.map(l => `
      <div class="saved-letter">
        <p class="saved-date">Written ${new Date(l.createdAt).toLocaleDateString()}</p>
        <p class="saved-text">${l.text}</p>
      </div>
    `).join('')}
  ` : '';

  const ready = letters.filter(l => l.openDate <= now && !l.opened && !l.saved);
  if (ready.length > 0) showPopup(user, ready[0]);
}

function showPopup(user, letter) {
  popupText.textContent = letter.text;
  popup.style.display = "flex";
  popupSave.textContent = "Save Letter";
  popupSave.disabled = false;

  const updateLetter = async (updates) => {
    await updateDoc(doc(db, "users", user.uid, "letters", letter.id), updates);
    loadLetters(user);
  };

  popupSave.onclick = async () => {
    popupSave.textContent = "Saved";
    popupSave.disabled = true;
    await updateLetter({ opened: true, saved: true });
  };

  popupClose.onclick = async () => {
    popup.style.display = "none";
    await updateLetter({ opened: true });
  };
}

onAuthStateChanged(auth, user => {
  if (!user) return (window.location.href = "index.html");

  loadCount(user);
  loadLetters(user);

  incBtn.addEventListener("click", () => handleCheckIn(user));
  sendLetterBtn.addEventListener("click", () => sendLetter(user));
});
