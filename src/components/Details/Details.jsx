import React, { useState } from 'react'
import "./Details.css"
import { ChevronDown, ArrowDownToLine  } from 'lucide-react'
import { auth, db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore'
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore'

const Details = () => {

  const [openBlock, setOpenBlock] = useState(false)
  const [openLogOut, setOpenLogOut] = useState(false)

  const {chatId, user, isCurrentUserBlocked, isRecieverBlocked, changeBlock} = useChatStore();
  const {currentUser} = useUserStore()

  const handleBlock = async()=>{
      if (!user) return;

      const userDocRef = doc(db, "users", currentUser.id)

      try{
        await updateDoc(userDocRef, {
          blocked: isRecieverBlocked ? arrayRemove(user.id) : arrayUnion(user.id)
        });
        changeBlock()
        setOpenBlock(false)
      }catch (err){
        console.log(err)
      }
  }
  return (
    <div className='detail text-white'>
       <div className='flex flex-col items-center border-b border-b-white/50 pt-6 pb-6 '>
          <img src={user?.avatar || "./assets/user.jpg"} className='w-[80px] h-[80px] rounded-full object-cover '/>
          <p className='font-semibold mt-4 text-[18px] '>{user?.username}</p>
          {/* <p className='text-white/80 mt-1 font-medium text-[14px] '>Lorem ipsum</p> */}
       </div>

       <div className='p-4 flex flex-col  gap-y-6 '>
       
         <div className='w-full flex justify-between items-center'>
            <p>Chat Settings</p>
            <div className='w-[24px] h-[24px] rounded-full bg-white/20 flex justify-center items-center '>
            <ChevronDown size={20} className="cursor-pointer" />
            </div>   
         </div>

         <div className='w-full flex justify-between items-center'>
            <p>Privacy & Help</p>
            <div className='w-[24px] h-[24px] rounded-full bg-white/20 flex justify-center items-center '>
            <ChevronDown size={20} className="cursor-pointer" />
            </div>   
         </div>

        <div className='flex flex-col items-center gap-y-2 xl:mt-44 2xl:mt-[300px]  relative '>
        { openBlock && <div className='absolute w-[80%] h-fit px-5 py-3 rounded-[10px] bg-[rgb(38,0,49)] -top-40  '>
            <p>{ isRecieverBlocked ? "Are you sure you want to unblock the user?" : "Are you sure you want to block the user?"}</p>

            <div className='w-full flex flex-col items-center mt-2 gap-y-2 '>
            <button onClick={handleBlock} className='w-[80%] h-[30px] rounded-[10px] bg-red-500 font-medium hover:font-semibold hover:bg-red-800 duration-500 transition-all '> 
              {isCurrentUserBlocked ? "You are blocked!" : isRecieverBlocked ? "User Blocked" : "Block User"}</button>
            <button onClick={()=>setOpenBlock(false)}>Cancel</button>
            </div>

          </div>}

          { openLogOut && <div className='absolute w-[80%] h-fit px-5 py-3 rounded-[10px] bg-[rgb(38,0,49)] -top-40  '>
            <p>Are you sure you want to Log out?</p>

            <div className='w-full flex flex-col items-center mt-2 gap-y-2 '>
            <button onClick={()=>auth.signOut()} className='w-[80%] h-[30px] rounded-[10px] bg-red-500 font-medium hover:font-semibold hover:bg-red-800 duration-500 transition-all '> 
             Log out</button>
            <button onClick={()=>setOpenLogOut(false)}>Cancel</button>
            </div>

          </div>}
          <button onClick={()=>setOpenBlock(true)} className='w-[80%] h-[30px] rounded-[10px] bg-red-500 font-medium hover:font-semibold hover:bg-red-800 duration-500 transition-all '>
           {isCurrentUserBlocked ? "You are blocked!" : isRecieverBlocked ? "User Blocked" : "Block User"}
          </button>
          <button onClick={()=>setOpenLogOut(true)}  className='w-[80%] h-[30px] rounded-[10px] bg-[rgb(38,0,49)] font-medium hover:font-semibold hover:bg-white/80 hover:text-[rgb(38,0,49)] duration-500 transition-all '>
            Log Out
          </button>
        </div>
       </div>
    </div>
  )
}

export default Details
