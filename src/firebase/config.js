import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyB3YGbTnc2NB1mcGn8ZuoI3SqfPbkebmKU",
  authDomain:        "skyclerk-85677.firebaseapp.com",
  databaseURL:       "https://skyclerk-85677-default-rtdb.firebaseio.com",
  projectId:         "skyclerk-85677",
  storageBucket:     "skyclerk-85677.firebasestorage.app",
  messagingSenderId: "1038231109592",
  appId:             "1:1038231109592:web:2dcd5673e176d3645dbcad"
};

const app  = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;