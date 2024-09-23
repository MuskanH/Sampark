import React, { useEffect, useRef, useState } from 'react'
import "./Chat.css"
import {Phone, Video, Info, Image, Camera, Mic, Laugh, Smile, X} from "lucide-react"
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore'
import upload from '../../lib/upload'
// import { ReactMic } from 'react-mic'

const Chat = () => {
  const [showEmoji, setShowEmoji] = useState(false)
  const [text, setText] = useState("")
  const [chat,setChat] = useState()
  const {chatId, user, isCurrentUserBlocked, isRecieverBlocked} = useChatStore()
  const {currentUser} = useUserStore()
  const [img, setImg] = useState({file: null, url: ""})
  // const [audio, setAudio] = useState(null)
  // const [recording, setRecording] = useState(false)

  const handleEmoji = (e) =>{
    setText((prev)=>prev + e.emoji);
  }

  const handleImage = (e) =>{
    if(e.target.files[0]){
     setImg({
         file: e.target.files[0],
         url: URL.createObjectURL(e.target.files[0])
     })
    }
 }

  const endRef = useRef(null)

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth"});
  }, []);

  // useEffect(()=>{
  //   const unSub = onSnapshot(doc(db, "chats", chatId), (res)=>{
  //     setChat(res.data());
  //   });

  //   return () =>{
  //     unSub();
  //   };
  // }, [chatId]);


  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      const chatData = res.data();
      setChat(chatData);
  
      // Mark as seen when the receiver views the chat
      if (chatData && chatData.messages && chatData.messages.length > 0) {
        const lastMessage = chatData.messages[chatData.messages.length - 1];
        if (lastMessage.senderId !== currentUser.id) {
          // Update the `isSeen` flag only if the current user is the receiver
          updateDoc(doc(db, "chats", chatId), {
            "messages": chatData.messages.map((msg) => {
              if (msg.senderId !== currentUser.id) {
                return { ...msg, isSeen: true };
              }
              return msg;
            })
          });
        }
      }
    });
  
    return () => unSub();
  }, [chatId, currentUser.id]);
    console.log(chat)

  const handleSend = async()=>{
    if (text === "" && !audio && !img.file) return;

      let imgUrl = null;
      // let audioUrl = null;

      try {

        if (img.file) {
          imgUrl = await upload(img.file);
        }
        // if (audio) {
        //   audioUrl = await upload(audio);
        // }
       await updateDoc(doc(db, "chats", chatId ),{
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          isSeen: false,
          ...(imgUrl && {img: imgUrl}),
          // ...(audioUrl && {audio: audioUrl}),
        }),
       });

       const userIds = [currentUser.id, user.id]
       

       userIds.forEach(async(id)=>{
        const userChatsRef = doc(db, "userchats", id)
        const userChatsSnapshot = await getDoc(userChatsRef)

        if (userChatsSnapshot.exists()){
          const userChatsData = userChatsSnapshot.data()
  
          const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
          userChatsData.chats[chatIndex].lastMessage = text || "Audio message";
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
  
          await updateDoc(userChatsRef, {
             chats: userChatsData.chats
          });
         }
       })

       
      } catch(err){
        console.log(err)
      }

      setImg({file: null, url: ""});
      setText("");
      // setAudio(null)
  };

  // const startRecording = () => setRecording(true);
  // const stopRecording = () => setRecording(false);

  // const onStop = (recordedBlob) => {
  //   const audioFile = new File([recordedBlob.blob], "audio_message.webm", { type: "audio/webm" });
  //   setAudio(audioFile);
  //   console.log(audioFile)
  // };



  return (
    <div className='chat font-prompt relative text-white border-l border-white/50 border-r border-r-white/50 '>
     
      <div className='top flex justify-between py-5 px-4 border-b border-b-white/50'>
        <div className='user flex gap-x-5 items-center'>
           <img src={user?.avatar || "./assets/user.jpg"} className='w-[50px] h-[50px] rounded-full object-cover'/>
           <div className='texts'>
             <p className='font-semibold '>{user?.username}</p>
             {/* <p className='text-white/80 '>Lorem ipsum</p> */}
           </div>
        </div>

        <div className='icons flex items-center gap-x-5'>
          <Phone className='cursor-pointer'/>
          <Video className='cursor-pointer'/>
          <Info className="cursor-pointer"/>

        </div>
      </div>

      <div className='center p-5 overflow-y-scroll flex flex-col gap-5 h-[75%] '>


       {chat?.messages?.map((message)=>{
        return (
          <div className={message.senderId === currentUser?.id ? "message own " : "message"} key={message?.createdAt} >
          <div className={`texts `}>
          {message.img && <img src={message.img}/>}
          {/* {message.audio && (
                <audio controls >
                  <source src={message.audio} type="audio/webm"  />
                  Your browser does not support the audio element.
                </audio>
              )} */}
          {message.text && <p className={`${message.senderId === currentUser?.id ? "bg-[rgb(38,0,49)]" : "bg-[rgb(104,44,121)] p-5 rounded-[10px] w-fit h-fit "}`}>
             {message.text}
            </p>}
            {message.senderId === currentUser.id && message.isSeen && (
             <span className='time text-white'>Seen</span> 
            )}
          </div>
        </div>
        )
       })}

      {img.url && (
        <div className='message own'>
          <div className='texts'>
            <img src={img.url} alt=""/>
          </div>
        </div>
      )}

      <div ref={endRef}></div>

      </div>

      <div className='bottom w-full absolute bottom-3 border-t bg-black border-t-white/50 pt-3 flex items-center gap-x-5 px-4  mt-5'>
        <div className='icons flex gap-x-4'>
          <label htmlFor='file' >
          <Image className='cursor-pointer'/>
          </label>
          <input id='file' type='file' className='hidden' onChange={handleImage}/>
          
          <Camera className='cursor-pointer'/>
          {/* <Mic className='cursor-pointer' onMouseDown={startRecording} onMouseUp={stopRecording}/> */}
        </div>
        {/* <ReactMic
          record={recording}
          className="sound-wave  w-[40px] h-[20px] "
          onStop={onStop}
          mimeType="audio/webm"
        /> */}

        <input type='text' disabled={isCurrentUserBlocked || isRecieverBlocked} value={text} placeholder={isCurrentUserBlocked || isRecieverBlocked ? "You cannot send a message" : 'Type a message.....'} onChange={e=>setText(e.target.value)} className='w-[60%] h-[40px] px-2 disabled:cursor-not-allowed rounded-[10px] bg-white/20 '/>
        <div className='relative  '>
        <Smile onClick={()=>setShowEmoji(!showEmoji)} className='cursor-pointer '/>
        {showEmoji &&
        <>
              <div className='flex justify-end absolute bottom-[490px] left-[345px]  z-50 '>
      <div className='w-[30px] h-[30px] rounded-full bg-white flex justify-center items-center '>
        <X color='black' onClick={()=>setShowEmoji(false)} className='cursor-pointer  ' />
        </div>
      </div>
        <div className='absolute bottom-[50px] z-50 left-0 '>
        <EmojiPicker onEmojiClick={handleEmoji}/>
        </div>
        </>} 
        </div>
       
        <button onClick={handleSend} disabled={isCurrentUserBlocked || isRecieverBlocked} className='w-[80px] h-[40px] rounded-[10px] disabled:cursor-not-allowed bg-[rgb(38,0,49)] font-medium hover:font-semibold hover:bg-white hover:text-[rgb(38,0,49)] duration-500 transition-all '>Send</button>
      </div>

    </div>
    
  )
}

export default Chat
