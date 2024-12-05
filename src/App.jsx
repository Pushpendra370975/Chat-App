import React, { useEffect, useState } from 'react' // Add useState
import Chat from './components/chat/Chat'
import List from './components/list/List'
import Detail from './components/details/Detail'
import Login from './components/login/Login'
import Notification from './components/notification/Notification'
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth'
import { useUserStore } from './lib/userStore'
import { useChatStore } from './lib/chatStore'

const App = () => {
  const [showDetail, setShowDetail] = useState(true); // Add this state
  const {chatId} = useChatStore();
  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  
  useEffect(() => {
    console.log("Setting up auth listener");
    const unSub = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user?.uid);
      if (user) {
        fetchUserInfo(user.uid);
      } else {
        useUserStore.getState().fetchUserInfo(null);
      }
    });
    return () => unSub();
  }, []);
  
  
  if (isLoading) {
    console.log("Showing loading state");
    return <div className='loading'>Loading....</div>;
  }

  
  return (
    <div className='container'>
      {currentUser ? (
        <>
          <List/>
          {chatId && (
            <div className='chat-container'>
              <Chat showDetail={showDetail} setShowDetail={setShowDetail} />
              {showDetail && <Detail/>}
            </div>
          )}
        </>
      ) : (
        <Login/>
      )}
      <Notification/>
    </div>
  )
}

export default App