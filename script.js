const loginBtn = document.getElementById("loginBtn");
const toMeBtn = document.getElementById("to_me");
const fromYouBtn = document.getElementById("from_you");

loginBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});
toMeBtn.addEventListener("click", () => {
    window.location.href = "social.html";
});
fromYouBtn.addEventListener("click", () => {
    window.location.href = "personal.html";
});