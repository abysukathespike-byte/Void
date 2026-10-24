const firebaseConfig = {
  apiKey: "AIzaSyB8hulLpdcMXZDYBo_zfbykrECG_kme3cM",
  authDomain: "yummyproject-3f5bb.firebaseapp.com",
  databaseURL: "https://yummyproject-3f5bb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "yummyproject-3f5bb",
  storageBucket: "yummyproject-3f5bb.firebasestorage.app",
  messagingSenderId: "837891726091",
  appId: "1:837891726091:web:2832318052a9d1d9ad600e",
  measurementId: "G-50FWQQ7XQS"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const auth = firebase.auth();