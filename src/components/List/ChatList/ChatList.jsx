import React, { useEffect, useState } from 'react'
import {Search, Plus, Minus, Trash2 } from "lucide-react"
import AddUser from '../../AddUser/AddUser'
import { useUserStore } from '../../../lib/userStore'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { useChatStore } from '../../../lib/chatStore'

const ChatList = () => {
    const [toggle, setToggle] = useState(false)
    const [chats, setChats] = useState([])
    const [input, setInput] = useState("")

    const {currentUser} = useUserStore();
    const {chatId, changeChat, resetChat} = useChatStore();
    const [chatDeletedId, setChatDeleteId] = useState(null)
    const [chatDeleteOpen, setChatDeleteOpen] = useState(false)
    
    useEffect(() => {
      const unSub = onSnapshot(
        doc(db, "userchats", currentUser.id),
        async (res) => {
          const items = res.data().chats;
  
          const promises = items.map(async (item) => {
            const userDocRef = doc(db, "users", item.recieverId);
            const userDocSnap = await getDoc(userDocRef);
  
            const user = userDocSnap.data();
  
            return { ...item, user };
          });
  
          const chatData = await Promise.all(promises);
  
          setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        }
      );
  
      return () => {
        unSub();
      };
    }, [currentUser.id]);

    console.log(chats)
    const handleSelect = async (chat) =>{

      const userChats = chats.map((item)=>{
        const {user, ...rest} = item;
        return rest;
      });

      const chatIndex = userChats.findIndex(
        (item)=> item.chatId === chat.chatId
      );

      userChats[chatIndex].isSeen = true;
      const userChatsRef = doc(db, "userchats", currentUser.id)

      try {
        await updateDoc(userChatsRef, {
          chats: userChats,
        });
        changeChat(chat.chatId, chat.user)
      } catch(err){
        console.log(err)
      }
    }


    


    const filteredChats = chats.filter((c)=> c.user.username.toLowerCase().includes(input.toLowerCase()));

  return (
    <div className='chatList  overflow-y-scroll  text-white  p-5'>
     <div className='flex justify-between gap-x-5'>  
      <div className='searchBar w-[85%] pl-2 flex gap-x-5 items-center bg-white/20 backdrop-blur-sm h-[30px]  rounded-[5px]'>
      <Search color='#ffffff' size={20}/>
      <input placeholder='Search' onChange={(e)=>setInput(e.target.value)} className='search placeholder:text-white bg-transparent w-full h-full focus:outline-none outline-none '/>
      </div>
      <div onClick={()=>setToggle(!toggle)} className=' cursor-pointer bg-white/20 backdrop-blur-sm flex justify-center items-center w-[30px] h-[30px] rounded-[5px]'>
        {toggle ? <Minus color='#ffffff' size={20}/> : <Plus color='#ffffff' size={20}/>}  
      </div>
      </div> 

      <div className='mt-6 '>
        {filteredChats.map((chat)=>{
          return (
            <div key={chat.chatId} onClick={()=>handleSelect(chat)} className={`relative flex items-center justify-between h-[80px] cursor-pointer ${chat?.isSeen ? "bg-transparent" : "bg-[rgb(38,0,49)]" }  gap-x-5 border-b  border-b-[#e4e4e4]`}>
           
           <div className='flex items-center gap-x-4'>

            <img src={ chat.user.blocked.includes(currentUser.id) ? './assets/user.jpg': chat.user.avatar || './assets/user.jpg'} className='w-[44px] h-[44px] rounded-full object-cover '/>
            <div>
              <p className='text-[#e4e4e4]'>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</p>
              <p className='text-[#e4e4e4]'>{chat.lastMessage}</p>
            </div>
           </div>
           </div>
          )
        })}

        
      </div>
     {toggle && <AddUser/> }
    </div>
  )
}

export default ChatList
