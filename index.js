import { auth, db } from "./firebase.js";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

function setMessage(text) {
  document.getElementById("message").innerText = text;
}

window.showLogin = function () {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display  = "block";
  document.getElementById("form-title").innerText      = "Log In";
  setMessage("");
};

window.showSignup = function () {
  document.getElementById("signup-form").style.display = "block";
  document.getElementById("login-form").style.display  = "none";
  document.getElementById("form-title").innerText      = "Create An Account";
  setMessage("");
};

window.signUp = async function () {
  const username        = document.getElementById("username-input").value.trim();
  const email           = document.getElementById("email-input").value.trim();
  const password        = document.getElementById("password-input").value;
  const confirmPassword = document.getElementById("confirmpassword-input").value;

  if (!username) { setMessage("Please enter a username."); return; }
  if (!email)    { setMessage("Please enter an email.");   return; }

  if (password !== confirmPassword) {
    setMessage("Passwords do not match.");
    return;
  }

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(user, { displayName: username });

    await setDoc(doc(db, "users", user.uid), {
      uid:       user.uid,
      username,
      email,
      createdAt: new Date(),
    });

    setMessage("Account created! Welcome, " + username + ".");
        window.location.href = "personal.html";

  } catch (error) {
    setMessage(error.message);
  }
};

window.login = async function () {
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    setMessage("Logged in!");
        window.location.href = "personal.html";

  } catch (error) {
    setMessage(error.message);
  }
};