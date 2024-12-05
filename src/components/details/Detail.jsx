// src/components/details/Detail.jsx

import React, { useState, useEffect } from 'react'
import './detail.css'
import { auth, db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore'
import { arrayRemove, arrayUnion, updateDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();
  const [openSettings, setOpenSettings] = useState(false);
  const [showClearChatDialog, setShowClearChatDialog] = useState(false);
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [showPhotos, setShowPhotos] = useState(false); 

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (doc) => {
        if (doc.exists()) {
          const messages = doc.data().message || [];
          const photos = messages
            .filter(msg => msg.img)
            .map(msg => ({
              url: msg.img,
              timestamp: msg.createdAt
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
          setSharedPhotos(photos);
        }
      });
      return () => unSub();
    }
  }, [chatId]);

  const handleBlock = async () => {
    if (!user) return null;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      })
      changeBlock()
      setOpenSettings(false);
    } catch (error) {
      console.log(error);
    }
  }

  const handleClearChat = async () => {
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        message: []
      });
      
      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = "";
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });

      setShowClearChatDialog(false);
      setOpenSettings(false);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>{user?.status}</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title" onClick={() => setOpenSettings(!openSettings)}>
            <span>Chat Settings</span>
            <img src={openSettings ? "./arrowDown.png" : "./arrowUp.png"} alt="" />
          </div>
          {openSettings && (
            <div className="settings-dropdown">
              <div 
                className={`setting-item ${isCurrentUserBlocked ? 'disabled' : ''}`}
                onClick={!isCurrentUserBlocked ? handleBlock : undefined}
              >
                <span className="setting-text">
                  {isCurrentUserBlocked ? 
                    "You are blocked" : 
                    isReceiverBlocked ? 
                    "Unblock User" : 
                    "Block User"
                  }
                </span>
              </div>
              <div 
                className="setting-item"
                onClick={() => setShowClearChatDialog(true)}
              >
                <span className="setting-text">Clear Chat</span>
              </div>
            </div>
          )}
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title" onClick={() => setShowPhotos(!showPhotos)}>
            <span>Shared Photos</span>
            <img src={showPhotos ? "./arrowDown.png" : "./arrowUp.png"} alt="" />
          </div>
          {showPhotos && (
            <div className="photos">
              {sharedPhotos.length > 0 ? (
                sharedPhotos.map((photo, index) => (
                  <div className="photoitem" key={index}>
                    <div className="photoDetails">
                      <img 
                        src={photo.url} 
                        alt="" 
                        onClick={() => window.open(photo.url, '_blank')}
                      />
                      <span>Photo {index + 1}</span>
                    </div>
                    <img 
                      src="./download.png" 
                      alt="" 
                      className='icon'
                      onClick={() => window.open(photo.url, '_blank')} 
                    />
                  </div>
                ))
              ) : (
                <div className="no-photos">No shared photos</div>
              )}
            </div>
          )}
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button className='logout' onClick={() => auth.signOut()}>Logout</button>
      </div>

      {showClearChatDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Clear Chat</h3>
            <p>Are you sure you want to clear all messages?</p>
            <div className="modal-buttons">
              <button onClick={handleClearChat}>
                Clear Chat
              </button>
              <button 
                className="cancel"
                onClick={() => setShowClearChatDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Detail