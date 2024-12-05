import React, { useState } from 'react'
import './login.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from 'firebase/auth';
import { auth ,db } from '../../lib/firebase';
import {doc,setDoc,getDoc} from "firebase/firestore";
import upload from '../../lib/upload';

const Login=()=> {

  const [avatar,setAvatar]=useState({
    file:null,
    url:""
  })
  const [loading,setloading]=useState(false);

  const handleAvatar=(e)=>{
    if(e.target.files[0]){
    setAvatar({
      file:e.target.files[0],
      url:URL.createObjectURL(e.target.files[0])
    })
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setloading(true);
  
    const formData = new FormData(e.target);
    const {email, password} = Object.fromEntries(formData);
    
    try {
      console.log("Starting login process");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User authenticated:", userCredential.user.uid);
      
      // Check user document
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      console.log("User document exists?", userDocSnap.exists());
      
      if (!userDocSnap.exists()) {
        console.log("Creating new user document");
        // Create user document
        await setDoc(userDocRef, {
          username: email.split('@')[0],
          email: email,
          id: userCredential.user.uid,
          status: "Available",
          blocked: [],
          avatar: null
        });
  
        // Create userchats document
        await setDoc(doc(db, "userchats", userCredential.user.uid), {
          chats: []
        });
        
        console.log("User documents created successfully");
      }
      
      // Fetch the user document again to confirm
      const updatedDoc = await getDoc(userDocRef);
      console.log("Updated user document:", updatedDoc.data());
      
      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
    } finally {
      setloading(false);
    }
  }

  const handleRegister=async(e)=>{
    e.preventDefault();
    setloading(true);
    const formData=new FormData(e.target);
    const {username,email,password,status}=Object.fromEntries(formData);
    
    try {
      const res = await createUserWithEmailAndPassword(auth,email,password)
      const imgUrl = await upload(avatar.file)

      await setDoc (doc(db,"users",res.user.uid),{
        username,
        email,
        status, 
        avatar:imgUrl,
        id: res.user.uid,
        blocked:[],
      });

      await setDoc (doc(db,"userchats",res.user.uid),{
        chats:[]
      });
      toast.success("Account created successfully");
    } catch (err) {
      console.log(err)
      toast.error(err.message)
    }finally{
      setloading(false);
    }
  }
  return (
    <div className='login'>
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder='Email' name='email' />
          <input type="Password" placeholder='Password' name='password' />
          <button disabled={loading}>{loading ? "loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
      <h2>Create an account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png "} alt="" />
            Upload an image
          </label>
          <input type="file" id='file' style={{display:'none'}} onChange={handleAvatar} />
          <input type="text" placeholder='Username' name='username' />
          <input type="text" placeholder='Email' name='email' />
          <input type="Password" placeholder='Password' name='password' />
          <input type="text" placeholder='Status' name='status' />
          <button disabled={loading}>{loading ? "loading" :"Create Account"}</button>
        </form>
      </div>
    </div>
  )
}

export default Login
