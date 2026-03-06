import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc }
    from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDGPo9LZNelY114oV_QILO7p6xV6f91Uss",
    authDomain: "my-own-project-47240.firebaseapp.com",
    projectId: "my-own-project-47240",
    storageBucket: "my-own-project-47240.firebasestorage.app",
    messagingSenderId: "1045587179020",
    appId: "1:1045587179020:web:dcd8ac9d9272e6dcb8e029",
    measurementId: "G-JFW9SQEHZB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const btn = document.getElementById("dreamBtn");

btn.addEventListener("click", async function () {

    const title = document.getElementById("title").value;
    const price = document.getElementById("Price").value;
    const imageUrl = document.getElementById("url").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    try {
        await addDoc(collection(db, "products"), {
            title,
            price,
            imageUrl,
            category,
            description
        });

        console.log("Data written successfully!");

    } catch (error) {
        console.error("Error:", error);
    }

});

const clearBtn = document.getElementById("clearBtn");

clearBtn.addEventListener("click", function () {
    document.getElementById("title").value = "";
    document.getElementById("Price").value = "";
    document.getElementById("url").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";
});
