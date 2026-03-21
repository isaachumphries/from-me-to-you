<script type="module">

  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDFS0Wlt8EU5fFqxBpi3yMTaw-xiA2Iozs",
    authDomain: "from-me-to-you-d7305.firebaseapp.com",
    projectId: "from-me-to-you-d7305",
    storageBucket: "from-me-to-you-d7305.firebasestorage.app",
    messagingSenderId: "561689421556",
    appId: "1:561689421556:web:0600b5dee14c2b368b60a1"
  };

  const app = initializeApp(firebaseConfig);
  export const db = getFirestore(app);
  export const auth = getAuth(app);

</script>
