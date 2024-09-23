import { useEffect, useState } from 'react'
import "./App.css"
import List from './components/List/List'
import Chat from './components/Chat/Chat'
import Details from './components/Details/Details'
import Login from './components/Login/Login'
import Notification from './components/Notification/Notification'
import { onAuthStateChanged } from 'firebase/auth'
import { useUserStore } from './lib/userStore'
import { auth } from './lib/firebase'
import { useChatStore } from './lib/chatStore'

function App() {
  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  const {chatId} = useChatStore();
  
  useEffect(()=>{
    const unSub = onAuthStateChanged(auth, (user)=>{
      fetchUserInfo(user?.uid)
    });

    return () =>{
      unSub();
    };
  }, [fetchUserInfo]);
 
  if (isLoading) return <p className='text-white font-semibold text-[16px] '>Loading...</p>

  return (
    <>
     <div className='container w-[90vw] h-[90vh] flex bg-black/70 backdrop-blur-sm rounded-[20px] '>
      {currentUser ? <>
        <List/>
        {chatId && <Chat/>}
        {chatId && <Details/>}
      </> : <Login/>}
      <Notification/>
       
     </div>
    </>
  )
}

export default App
