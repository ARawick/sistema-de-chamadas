import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC0IskOStK_ToSpe1T3NGgLuE7CovnU3xk',
  authDomain: 'projeto-sistema-chamadas.firebaseapp.com',
  projectId: 'projeto-sistema-chamadas',
  storageBucket: 'projeto-sistema-chamadas.appspot.com',
  messagingSenderId: '342736545621',
  appId: '1:342736545621:web:74cb40fa84fb22a87971dc',
  measurementId: 'G-Z73Y7WBG2J',
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export { auth, db, storage };
