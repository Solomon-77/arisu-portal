import { useRef, useState, useEffect } from 'react';
import firebase, { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import arisu from './img/arisu.png';

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    if (isMobile()) {
      auth.signInWithRedirect(provider);
    } else {
      auth.signInWithPopup(provider);
    }
  };

  const isMobile = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /mobile/i.test(userAgent);
  };

  return (
    <div className="font-inter h-screen w-full bg-neutral-200 flex flex-col items-center justify-center">
      <img src={arisu} className="arisu-image h-32 rounded-xl -mt-10" alt="Arisu" />
      <div className="flex text-4xl font-extrabold mt-11">
        <h1 className="gradient-text mr-2">ARISU</h1>
        <h1>Portal</h1>
      </div>
      <div onClick={signInWithGoogle} className="flex bg-white shadow-md mt-8 items-center rounded-md py-3 px-4 cursor-pointer">
        <img src="https://img.icons8.com/?size=256&id=17949&format=png" className="h-7" alt="Google Icon" />
        <h1 className="font-semibold ml-2">Sign in with Google</h1>
      </div>
    </div>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = db.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const offensiveWords = [
    'nigga', 'n1gga', 'nigger', 'n1gg4', 'niigga', 'niggah', 'negga', 'niggaa', 'neggaaa', 'niiggaa', 'niggaaa',
    'nigg', 'n1gg4', 'n1g', 'n1g4', 'nig4', 'n1gga', 'n1ggah',
    'nigguh', 'nigg4', 'niig', 'niigg', 'niigah', 'niigguh', 'niggay', 'ngga', 'n11gga', 'niga', 'neegga', 'nega', 'n33ga', 'kneega', 'n33gga', 'niggaa', 'neega', 'n3ggaa', 'n3gga'
  ];

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    const isOffensive = offensiveWords.some(word => formValue.toLowerCase().includes(word));

    if (isOffensive) {
      setFormValue('');
      const input = document.querySelector('input');
      input.disabled = true;

      let seconds = 60;
      const timer = setInterval(() => {
        input.placeholder = `Muted for ${--seconds} seconds`;
        if (seconds <= 0) {
          clearInterval(timer);
          input.disabled = false;
          input.placeholder = 'Your message here ...';
        }
      }, 1000);

      await messagesRef.add({
        text: `I'm muted for 1 minute for using the word ****`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      });
    } else {
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      });
      setFormValue('');
    }
  };

  return (
    <main className="h-screen w-full bg-neutral-200 grid place-items-center font-inter">
      <div className="md:h-[90vh] h-screen md:w-[50%] w-full pb-[54px] pt-[58px] bg-white rounded-lg drop-shadow-lg">
        <div onClick={() => auth.signOut()} className="fixed cursor-pointer top-[14px] right-6 px-3 rounded-md py-1 bg-neutral-700 text-white">Sign out</div>
        <div className="fixed top-[14px] font-semibold text-xl left-5">黑鬼喋喋不休</div>
        <div className="h-full overflow-auto p-10 pb-7">
          {messages && messages.map((msg, index) =>
            <ChatMessage key={`${msg.id} ${index}`} message={msg} />
          )}
          <div ref={dummy} />
        </div>
        <form onSubmit={sendMessage} className="flex items-center justify-center">
          <input className="ml-[9px] mt-[8px] border border-neutral-400 rounded-lg px-3 h-full w-full mr-3 py-2 outline-none bg-neutral-150" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Your message here ..." />
          <button className="text-2xl mr-4 mt-2 cursor-pointer" type="submit" disabled={!formValue}>🕊️</button>
        </form>
      </div>
    </main>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? ' justify-end' : 'justify-start';

  return (
    <div className={`font-inter flex py-[6px] ${messageClass}`}>
      <div className={`flex items-center ${uid === auth.currentUser.uid ? 'flex-row-reverse' : ''}`}>
        <img src={photoURL} className="h-9 rounded-full" alt="User" />
        <p className={`md:max-w-[240px] max-w-[200px] px-[14px] break-words py-1 rounded-2xl ${uid === auth.currentUser.uid ? 'mr-2 bg-blue-500 text-white' : 'ml-2 bg-neutral-200'}`}>{text}</p>
      </div>
    </div>
  );
}

export default App;