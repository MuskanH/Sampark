
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"
import { getStorage} from "firebase/storage"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "sampark-8111f.firebaseapp.com",
  projectId: "sampark-8111f",
  storageBucket: "sampark-8111f.appspot.com",
  messagingSenderId: "64923011094",
  appId: "1:64923011094:web:cbfc55f8835fbe84120d37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);