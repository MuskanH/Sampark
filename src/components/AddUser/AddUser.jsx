import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import React, { useState } from 'react'
import { db } from '../../lib/firebase'
import { useUserStore } from '../../lib/userStore'

const AddUser = () => {
  const [users,setUsers] = useState([])
  const {currentUser} = useUserStore()

  const handleSearch = async (e) =>{
    e.preventDefault()
    const formData = new FormData(e.target)
    const username = formData.get("username")

    try{
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username))

      const querySnapShot = await getDocs(q)

      if (!querySnapShot.empty) {
        const users = querySnapShot.docs.map(doc => doc.data());
        setUsers(users); // Store an array of users
      } else {
        setUsers([]); // No users found
      }
    } catch(err){
      console.log(err)
    }
  }

  const handleAdd = async (user) => {
    if (!user) return; // Make sure a user is selected
  
    const chatRef = collection(db, "chats");
    const userChatsRef = doc(db, "userchats", currentUser.id);
  
    try {
      // Fetch the current user's chats
      const userChatsSnap = await getDoc(userChatsRef);
      if (userChatsSnap.exists()) {
        const userChats = userChatsSnap.data().chats || [];
  
        // Check if the selected user is already in the chat list
        const isUserAlreadyAdded = userChats.some(
          (chat) => chat.recieverId === user.id
        );
  
        if (isUserAlreadyAdded) {
          alert("User is already added.");
          return; // Exit the function if the user is already in the chat list
        }
      }
  
      // If the user is not already added, proceed with creating a new chat
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
  
      // Add the new chat to both users' chat lists
      await updateDoc(doc(db, "userchats", user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          recieverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });
  
      await updateDoc(doc(db, "userchats", currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          recieverId: user.id,
          updatedAt: Date.now(),
        }),
      });
  
      console.log("New chat added with ID:", newChatRef.id);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className='addUser w-max h-max p-[30px] bg-black/80 z-50 rounded-[10px] top-0 left-0 right-0 bottom-0 absolute m-auto '>
      <form onSubmit={handleSearch} className='flex gap-5 '>
        <input type='text' placeholder='Username' name='username' className='px-5 py-2 rounded-[10px] text-black outline-none duration-500 transition-all focus:outline-[rgb(38,0,49)]  ' />
        <button className='px-5 py-2 rounded-[10px] bg-[rgb(38,0,49)] text-white font-medium hover:bg-white hover:text-[rgb(38,0,49)] duration-500 transition-all '>Search</button>
      </form>

      {users.length > 0 && (
  <div className='userList mt-10'>
    {users.map((user, index) => (
      <div key={index} className='user flex gap-5 mt-2'>
        <div className='detail flex items-center gap-x-3'>
          <img src={user.avatar || "./assets/user.jpg"} className='w-[35px] h-[35px] rounded-full object-cover' alt={user.username} />
          <span>{user.username}</span>
        </div>
        <button onClick={() => handleAdd(user)} className='px-5 py-2 rounded-[10px] bg-[rgb(38,0,49)] text-white text-[12px] hover:font-medium font-medium hover:bg-white hover:text-[rgb(38,0,49)] duration-500 transition-all'>Add User</button>
      </div>
    ))}
  </div>
)}

{users.length === 0 && <p className='text-center mt-5'>No User found</p>}
    </div>
  )
}

export default AddUser
