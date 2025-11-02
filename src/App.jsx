import React, { useState, useEffect, useMemo } from 'react';

// --- Importações do Firebase ---
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc, getDoc, updateDoc, writeBatch } from "firebase/firestore";

// --- Importações de Ícones ---
import { BookOpen, Target, Check, Trash2, Plus, Heart, LogOut, ChevronRight, ChevronDown, TrendingUp, Search, Copy, Church, Minus, PlusCircle, BookCheck, LayoutGrid } from 'lucide-react';

// --- Dicionário com Capítulos da Bíblia ---
const BIBLE_CHAPTERS = { "Gênesis": 50, "Êxodo": 40, "Levítico": 27, "Números": 36, "Deuteronômio": 34, "Josué": 24, "Juízes": 21, "Rute": 4, "1 Samuel": 31, "2 Samuel": 24, "1 Reis": 22, "2 Reis": 25, "1 Crônicas": 29, "2 Crônicas": 36, "Esdras": 10, "Neemias": 13, "Ester": 10, "Jó": 42, "Salmos": 150, "Provérbios": 31, "Eclesiastes": 12, "Cânticos": 8, "Isaías": 66, "Jeremias": 52, "Lamentações": 5, "Ezequiel": 48, "Daniel": 12, "Oséias": 14, "Joel": 3, "Amós": 9, "Obadias": 1, "Jonas": 4, "Miquéias": 7, "Naum": 3, "Habacuque": 3, "Sofonias": 3, "Ageu": 2, "Zacarias": 14, "Malaquias": 4, "Mateus": 28, "Marcos": 16, "Lucas": 24, "João": 21, "Atos": 28, "Romanos": 16, "1 Coríntios": 16, "2 Coríntios": 13, "Gálatas": 6, "Efésios": 6, "Filipenses": 4, "Colossenses": 4, "1 Tessalonicenses": 5, "2 Tessalonicenses": 3, "1 Timóteo": 6, "2 Timóteo": 4, "Tito": 3, "Filemom": 1, "Hebreus": 13, "Tiago": 5, "1 Pedro": 5, "2 Pedro": 3, "1 João": 5, "2 João": 1, "3 João": 1, "Judas": 1, "Apocalipse": 22 };
const TOTAL_BIBLE_CHAPTERS = Object.values(BIBLE_CHAPTERS).reduce((sum, count) => sum + count, 0);

// --- COLE AQUI SEU OBJETO DE CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDHUBmJPMxuaNSFWFZo0v4yJS4gJ-80exs",
  authDomain: "jornada-devocional.firebaseapp.com",
  projectId: "jornada-devocional",
  storageBucket: "jornada-devocional.firebasestorage.app",
  messagingSenderId: "831673625785",
  appId: "1:831673625785:web:9b05437e343782d00b7f68"
};
// ---------------------------------------------------------

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();


// --- Componente Principal ---
const App = () => {
  const [user, setUser] = useState(null);
  const [coupleId, setCoupleId] = useState(null);
  const [devotionalData, setDevotionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCoupleId(userDocSnap.data().coupleId || null);
        } else {
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            coupleId: null,
          });
          setCoupleId(null);
        }
        setUser(currentUser);
      } else {
        setUser(null);
        setCoupleId(null);
        setDevotionalData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe;
    if (user && coupleId) {
      setLoading(true);
      const devotionalSpaceRef = doc(db, "devotionalSpaces", coupleId);
      unsubscribe = onSnapshot(devotionalSpaceRef, (docSnap) => {
        if (docSnap.exists()) {
          setDevotionalData(docSnap.data());
        } else {
          setError("Espaço devocional não encontrado.");
        }
        setLoading(false);
      }, (err) => {
        setError("Erro ao buscar dados: " + err.message);
        setLoading(false);
      });
    }
    return () => unsubscribe && unsubscribe();
  }, [user, coupleId]);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider).catch(err => setError("Erro ao fazer login: " + err.message));
  };
  const handleSignOut = () => {
    signOut(auth).catch(err => setError("Erro ao sair: " + err.message));
  };

  const handleCreateSpace = async () => {
    const newCoupleId = `casal_${Date.now()}`;
    const userDocRef = doc(db, "users", user.uid);
    const devotionalSpaceRef = doc(db, "devotionalSpaces", newCoupleId);

    const batch = writeBatch(db);
    batch.set(devotionalSpaceRef, {
      members: [user.uid],
      createdAt: new Date(),
      readChapters: {}, notes: [], goals: [], prayerRequests: [], churchAttendance: 0, plans: [], kanban: { themes: {}, chapters: {}, themeOrder: [] }
    });
    batch.update(userDocRef, { coupleId: newCoupleId });
    await batch.commit();
    setCoupleId(newCoupleId);
  };

  const handleJoinSpace = async (idToJoin) => {
    const cleanId = idToJoin.trim();
    if (!cleanId) { setError("Por favor, insira um ID."); return; }

    const devotionalSpaceRef = doc(db, "devotionalSpaces", cleanId);
    const spaceDoc = await getDoc(devotionalSpaceRef);

    if (spaceDoc.exists()) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { coupleId: cleanId });
      await updateDoc(devotionalSpaceRef, {
        members: [...spaceDoc.data().members, user.uid]
      });
      setCoupleId(cleanId);
    } else {
      setError("ID do casal não encontrado. Verifique se foi digitado corretamente.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Heart className="h-12 w-12 text-rose-500 animate-pulse" /></div>;
  }

  if (!user) {
    return <LoginScreen onLogin={signInWithGoogle} error={error} />;
  }

  if (!coupleId) {
    return <CoupleConnector user={user} onCreate={handleCreateSpace} onJoin={handleJoinSpace} error={error} />;
  }

  if (!devotionalData) {
    return <div className="flex items-center justify-center min-h-screen">Carregando dados do casal...</div>;
  }

  return <MainApp user={user} onLogout={handleSignOut} devotionalData={devotionalData} coupleId={coupleId} />;
};

const LoginScreen = ({ onLogin, error }) => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-100 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
      <Heart className="mx-auto h-16 w-16 text-rose-500" />
      <h1 className="text-3xl font-bold text-gray-800 mt-4">Jornada Devocional</h1>
      <p className="text-gray-600 mt-2">Um espaço para o devocional do casal.</p>
      <button onClick={onLogin} className="mt-8 w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-6 h-6 mr-3" />
        Entrar com Google
      </button>
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  </div>
);

const CoupleConnector = ({ user, onCreate, onJoin, error }) => {
  const [idToJoin, setIdToJoin] = useState('');
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Bem-vindo(a), {user.displayName}!</h1>
        <p className="text-gray-600 mt-2">Vamos conectar você e seu par.</p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg">
            <h2 className="font-bold text-lg">Criar um novo espaço</h2>
            <p className="text-sm text-gray-500 my-2">Comece um novo espaço e convide seu par com o ID gerado.</p>
            <button onClick={onCreate} className="w-full bg-rose-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-600 transition">Criar</button>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="font-bold text-lg">Entrar em um espaço</h2>
            <p className="text-sm text-gray-500 my-2">Seu par já criou um espaço? Insira o ID aqui.</p>
            <input type="text" value={idToJoin} onChange={e => setIdToJoin(e.target.value)} placeholder="ID do Casal" className="w-full p-2 border rounded-lg mb-2" />
            <button onClick={() => onJoin(idToJoin)} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition">Entrar</button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
};

const MainApp = ({ user, onLogout, devotionalData, coupleId }) => {
  const [activeTab, setActiveTab] = useState('progress');
  const [copySuccess, setCopySuccess] = useState('');
  const [newNote, setNewNote] = useState({ reference: '', text: '' });
  const [newGoal, setNewGoal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPrayer, setNewPrayer] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newScriptureRef, setNewScriptureRef] = useState({});
  const [newThemeTitle, setNewThemeTitle] = useState('');
  const [newChapterContent, setNewChapterContent] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);

  const oldTestamentBooks = useMemo(() => Object.keys(BIBLE_CHAPTERS).slice(0, 39), []);
  const newTestamentBooks = useMemo(() => Object.keys(BIBLE_CHAPTERS).slice(39), []);

  const updateDevotionalData = async (newData) => {
    const devotionalSpaceRef = doc(db, "devotionalSpaces", coupleId);
    await updateDoc(devotionalSpaceRef, newData);
  };

  const handleToggleChapter = (bookName, chapter) => {
    const currentReadChapters = devotionalData.readChapters || {};
    const bookChapters = currentReadChapters[bookName] || [];
    const newBookChapters = bookChapters.includes(chapter) ? bookChapters.filter(ch => ch !== chapter) : [...bookChapters, chapter];
    const newReadChapters = { ...currentReadChapters, [bookName]: newBookChapters };
    if (newBookChapters.length === 0) delete newReadChapters[bookName];
    updateDevotionalData({ [`readChapters.${bookName}`]: newBookChapters.length > 0 ? newBookChapters : null });
  };

  // ... Implemente todas as outras funções de manipulação de dados usando `updateDevotionalData` ...

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-3"><Heart className="h-8 w-8 text-rose-500" /><h1 className="text-2xl font-bold text-gray-800">Jornada Devocional</h1></div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span className="font-semibold">ID do Casal:</span>
              <button onClick={() => navigator.clipboard.writeText(coupleId)} className="bg-rose-100 text-rose-700 py-1 px-2 rounded-md hover:bg-rose-200 transition" title="Copiar ID">{coupleId}</button>
            </div>
            <div className="flex items-center space-x-2">
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
              <button onClick={onLogout} className="text-sm text-gray-500 hover:text-rose-600 p-2 rounded-md hover:bg-rose-50 transition"><LogOut size={16} /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg h-fit">
            <div className="flex items-center space-x-2 mb-4"><BookOpen className="h-6 w-6 text-orange-500" /><h2 className="text-xl font-bold">Leitura da Bíblia</h2></div>
            <BookListComponent title="Antigo Testamento" books={oldTestamentBooks} readChaptersData={devotionalData.readChapters} onToggleChapter={handleToggleChapter} />
            <BookListComponent title="Novo Testamento" books={newTestamentBooks} readChaptersData={devotionalData.readChapters} onToggleChapter={handleToggleChapter} />
          </aside>

          <div className="lg:col-span-3">
            <div className="flex border-b border-gray-200 flex-wrap">
              <button onClick={() => setActiveTab('progress')} className={`flex items-center space-x-2 px-4 py-3 font-semibold ${activeTab === 'progress' ? 'border-b-2 border-rose-500 text-rose-600' : 'text-gray-500'}`}><TrendingUp size={18} /><span>Progresso</span></button>
              {/* ... outros botões de aba ... */}
            </div>
            <div className="mt-6">
              {/* ... renderização condicional das abas ... */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

