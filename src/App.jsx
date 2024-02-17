import { useRef, useState, useEffect } from 'react';
import firebase, { auth, db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import arisu from './img/arisu.png'

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
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
  }

  const isMobile = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /mobile/i.test(userAgent);
  }

  return (
    <div className='font-inter h-screen w-full bg-neutral-200 flex flex-col items-center justify-center'>
      <img src={arisu} className='arisu-image h-32 rounded-xl -mt-10' />
      <div className='flex text-4xl font-extrabold mt-11'>
        <h1 className='gradient-text mr-2'>ARISU</h1>
        <h1 className=''>Portal</h1>
      </div>
      <div onClick={signInWithGoogle} className='flex bg-white shadow-md mt-8 items-center rounded-md py-3 px-4 cursor-pointer'>
        <img src="https://img.icons8.com/?size=256&id=17949&format=png" className='h-7' />
        <h1 className='font-semibold ml-2'>Sign in with Google</h1>
      </div>
    </div>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = db.collection('messages');
  const query = messagesRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');

  }

  return (
    <main className='h-screen w-full bg-neutral-200 grid place-items-center font-inter'>
      <div className='md:h-[90vh] h-screen md:w-[50%] w-full pb-[37px] pt-[58px] bg-white rounded-lg drop-shadow-lg'>
        <div onClick={() => auth.signOut()} className='fixed cursor-pointer top-[14px] right-6 px-3 rounded-md py-1 bg-neutral-700 text-white'>Sign out</div>
        <div className='fixed top-[14px] font-semibold text-xl left-5'>黑鬼喋喋不休</div>
        <div className='h-full overflow-auto p-10'>
          {messages && messages.map((msg, index) =>
            <ChatMessage key={`${msg.id} ${index}`} message={msg} />
          )}
          <span ref={dummy}></span>
        </div>
        <form onSubmit={sendMessage} className='flex items-center justify-center'>
          <input className='border border-neutral-400 rounded-lg px-3 h-full w-full mr-3 py-2 outline-none bg-neutral-150' value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
          <button className='text-2xl mr-3 cursor-pointer' type="submit" disabled={!formValue}>🕊️</button>
        </form>
      </div>
    </main>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? ' justify-end' : 'justify-start';

  return (<>
    <div className={`font-inter flex py-[6px] ${messageClass} `}>
      <div className={`flex items-center ${uid === auth.currentUser.uid ? 'flex-row-reverse' : ''}`}>
        <img src={photoURL} className='h-9 rounded-full' />
        <p className={`max-w-[240px] px-[14px] py-1 break-all rounded-2xl ${uid === auth.currentUser.uid ? 'mr-2 bg-blue-500 text-white' : 'ml-2 bg-neutral-200'}`} >{text}</p>
      </div>
    </div>
  </>)
}

export default App;