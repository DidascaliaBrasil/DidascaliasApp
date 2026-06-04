import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAqZbCE5EDAGHEe8HVxleZOxQKD_iGB6BA",
  authDomain: "didascalias-server.firebaseapp.com",
  databaseURL: "https://didascalias-server-default-rtdb.firebaseio.com",
  projectId: "didascalias-server",
  storageBucket: "didascalias-server.firebasestorage.app",
  messagingSenderId: "696209392647",
  appId: "1:696209392647:web:a676a95aec2f9557ff16a2",
  measurementId: "G-WR8KHWLBQ3"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços de Autenticação e Realtime Database
const auth = getAuth(app);
const database = getDatabase(app);

// Exporta as instâncias para usá-las em outras partes do projeto
export { app, auth, database };