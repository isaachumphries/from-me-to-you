import { db } from "./firebase.js";
import {
    collection,
    addDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


function loadCategories() {
    const container = document.getElementById("category-list");

    console.log("Loading Firebase categories...");

    onSnapshot(collection(db, "categories"), (snapshot) => {
        console.log("Firebase categories:", snapshot.size);

        snapshot.forEach(doc => {
            const data = doc.data();
            const name = data.name;

            // Prevent duplicates
            const exists = [...container.children].some(btn =>
                btn.innerText.toLowerCase() === name.toLowerCase()
            );

            if (!exists) {
                const btn = document.createElement("button");
                btn.className = "category-btn";
                btn.innerText = name;
                btn.onclick = () => openCategory(name);

                container.appendChild(btn);
            }
        });
    });
}

window.onload = loadCategories;


async function addCategory() {
    const input = document.getElementById("new-category-input");
    const name = input.value.trim();

    if (!name) return;

    await addDoc(collection(db, "categories"), {
        name: name
    });

    input.value = "";
}


function openCategory(category) {
    document.getElementById("category-section").style.display = "none";
    document.getElementById("category-content").style.display = "block";

    document.getElementById("category-title").innerText = category;

    openTab("notes");
}

function goBack() {
    document.getElementById("category-section").style.display = "block";
    document.getElementById("category-content").style.display = "none";
}

function openTab(tab) {
    const tabs = document.getElementsByClassName("tab-content");

    for (let t of tabs) {
        t.style.display = "none";
    }

    document.getElementById(tab).style.display = "block";

    const category = document.getElementById("category-title").innerText;
    loadPosts(category, tab);
}


async function addPost(tab) {
    const input = document.getElementById(`${tab}-input`);
    const text = input.value.trim();

    if (!text) return;

    const category = document.getElementById("category-title").innerText;

    await addDoc(collection(db, "posts"), {
        category: category,
        type: tab,
        content: text,
        timestamp: Date.now()
    });

    input.value = "";
}

function loadPosts(category, tab) {
    const container = document.getElementById(tab);

    onSnapshot(collection(db, "posts"), (snapshot) => {
        container.innerHTML = `
            <h3>${tab}</h3>
            <input id="${tab}-input" placeholder="Write something...">
            <button onclick="addPost('${tab}')">Post</button>
        `;

        snapshot.forEach(doc => {
            const data = doc.data();

            if (data.category === category && data.type === tab) {
                const div = document.createElement("div");
                div.className = "post";
                div.innerText = data.content;
                container.appendChild(div);
            }
        });
    });
}


window.addCategory = addCategory;
window.addPost = addPost;
window.openCategory = openCategory;
window.openTab = openTab;
window.goBack = goBack;