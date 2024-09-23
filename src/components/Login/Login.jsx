import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import React, { useState } from 'react'
import {toast} from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { auth, db } from '../../lib/firebase';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import upload from '../../lib/upload';


const Login = () => {
    const [avatar, setAvatar] = useState({file: null, url: ""})
    const [toggle, setToggle] = useState("Sign In");
    const [loading,setLoading] = useState(false)

    const handleChangeAvatar = (e) =>{
       if(e.target.files[0]){
        setAvatar({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0])
        })
       }
    }

    
    const handleSignIn = async (e) => {
      e.preventDefault();
      setLoading(true);
    
      const formData = new FormData(e.target);
      const { email, password } = Object.fromEntries(formData);
    
      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        toast.error("Please enter a valid email address.");
        setLoading(false);
        return;
      }
    
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        console.log(err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    

    const handleSignUp = async (e) =>{
      e.preventDefault()
      setLoading(true)
      const formData = new FormData(e.target);
      const {username, email, password} = Object.fromEntries(formData);

      try{
        const res = await createUserWithEmailAndPassword(auth, email, password)
        const imgUrl = await upload(avatar.file)

        await setDoc(doc(db, "users", res.user.uid),{
         username, 
         email, 
         avatar: imgUrl,
         id: res.user.uid, 
         blocked: [],
        });

        await setDoc(doc(db, "userchats", res.user.uid),{
         chats: [],
        });

        toast.success("Account Created! You can login now.")
      }
      catch(err){
         console.log(err)
         toast.error(err.message)
      } finally{
         setLoading(false);
      }
    }

    // const handleSignUp = async (e) => {
    //   e.preventDefault();
    //   setLoading(true);
    
    //   const formData = new FormData(e.target);
    //   const { username, email, password } = Object.fromEntries(formData);
    
    //   // Email validation
    //   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailPattern.test(email)) {
    //     toast.error("Please enter a valid email address.");
    //     setLoading(false);
    //     return;
    //   }

    //   if (!username || !email || !password)
    //     return toast.warn("Please enter inputs!");
    //   if (!avatar.file) return toast.warn("Please upload an avatar!");
    //   if(password.length < 6) return toast.error("Password must be atleast 6 characters")
    
    //   try {

    //      // Check if username already exists
    //      const usersRef = collection(db, "users");
    //      const q = query(usersRef, where("username", "==", username));
    //      const querySnapshot = await getDocs(q);

    //      if (!querySnapshot.empty) {
    //          toast.error("Username already taken, please choose another one.");
    //          setLoading(false);
    //          return;
    //      }

    //     const res = await createUserWithEmailAndPassword(auth, email, password);
    //     const imgUrl = await upload(avatar.file);
    
    //     await setDoc(doc(db, "users", res.user.uid), {
    //       username,
    //       email,
    //       avatar: imgUrl,
    //       id: res.user.uid,
    //       blocked: [],
    //     });
    
    //     await setDoc(doc(db, "userchats", res.user.uid), {
    //       chats: [],
    //     });
    
    //     toast.success("Account Created! You can login now.");
    //   } catch (err) {
    //     console.log(err);
    //     toast.error(err.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // };




    function myFunction() {
      var x = document.getElementById("myInput");
      if (x.type === "password") {
        x.type = "text";
      } else {
        x.type = "password";
      }
    }

  return (
    <div className='flex font-prompt w-full text-white items-center justify-center'>
        {toggle === "Sign In" && <form onSubmit={handleSignIn} className='signIn w-[50%] flex flex-col items-center gap-y-4'>
         <p className='text-[20px] font-semibold mb-4 '>Welcome Back!</p>
         <input placeholder='Email' name='email' type='email' className='w-[300px] h-[40px] px-4 bg-white/20 rounded-[10px] ' />
         <input placeholder='Password' name='password' type='password' id='myInput' className='w-[300px] h-[40px] px-4 bg-white/20 rounded-[10px] ' />
         <div className='flex gap-x-2'>
          <input type="checkbox" onClick={myFunction} className='accent-[rgb(38,0,49)]'/>Show Password
         </div>    
         <button disabled={loading} className={`w-[300px] h-[40px] mt-2 rounded-[10px] ${loading && "cursor-none bg-[rgba(38,0,49,0.66)]"} bg-[rgb(38,0,49)] font-semibold hover:bg-white/80 hover:text-[rgb(38,0,49)] duration-500 transition-all `}>
         {loading ? "Loading" : "Sign In"} 
         </button>

         <p onClick={()=>setToggle("Sign Up")} className='text-white font-medium text-[14px] cursor-pointer '>Don't have an Account? <b className='underline font-medium '>Sign Up</b> </p>
      </form>}
      
      {toggle === "Sign Up" && <form onSubmit={handleSignUp} className='signUp w-[50%] flex flex-col items-center gap-y-4'>
         <p className='text-[20px] font-semibold mb-4 '>Create an Account</p>
         <input placeholder='Username' name='username' type='text' className='w-[300px] h-[40px] px-4 bg-white/20 rounded-[10px] ' />
         <input placeholder='Email' name='email' type='email' className='w-[300px] h-[40px] px-4 bg-white/20 rounded-[10px] ' />
         <input placeholder='Password' name='password' type='password' id='myInput' className='w-[300px] h-[40px] px-4 bg-white/20 rounded-[10px] ' />
         <div className='flex gap-x-2'>
          <input type="checkbox" onClick={myFunction} className='accent-[rgb(38,0,49)]'/>Show Password
         </div> 
        <div className='flex gap-x-2 items-center'>
        <img src={avatar.url || "./assets/user.jpg"} className='w-[40px] h-[40px] object-contain rounded-full ' />
         <label htmlFor='file' className='w-[200px] h-[30px] rounded-[10px] cursor-pointer bg-white font-semibold flex justify-center items-center text-[rgb(38,0,49)] text-[14px]  '>
            Upload an Image
         </label>
         <input type='file' className='hidden' id='file' name='file' onChange={handleChangeAvatar}  />
        </div>
        
         
         <button disabled={loading} className={`w-[300px] h-[40px] cursor-pointer mt-2 ${loading && "cursor-none bg-[rgba(38,0,49,0.66)]"} rounded-[10px] bg-[rgb(38,0,49)] font-semibold hover:bg-white/80 hover:text-[rgb(38,0,49)] duration-500 transition-all `}>
          {loading ? "Loading" : "Sign Up"} 
         </button>
         <p onClick={()=>setToggle("Sign In")} className='text-white font-medium text-[14px] cursor-pointer '>Already have an Account? <b className='underline font-medium '>Sign In</b> </p>
      </form>}
    </div>
  )
}

export default Login
