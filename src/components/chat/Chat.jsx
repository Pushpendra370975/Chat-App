import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import {
  TUICallKit,
  TUICallKitServer,
  TUICallType,
} from "@tencentcloud/call-uikit-react";
import * as GenerateTestUserSig from "../../debug/GenerateTestUserSig-es";
import { Timestamp } from "firebase/firestore";

const Chat = ({ showDetail, setShowDetail }) => {
  const [chat, setChat] = useState();
  const [open, setopen] = useState(false);
  const [text, setText] = useState("");
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();
  const [clearedAt, setClearedAt] = useState(0);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
      setCallerUserID(String(currentUser.id));
      setCalleeUserID(user.id);
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  // Fetch cleared timestamp when chat changes
  useEffect(() => {
    const fetchClearedTimestamp = async () => {
      if (currentUser?.id && chatId) {
        const userChatsRef = doc(db, "userchats", currentUser.id);
        const userChatsDoc = await getDoc(userChatsRef);

        if (userChatsDoc.exists()) {
          const userChatsData = userChatsDoc.data();
          const currentChat = userChatsData.chats.find(
            (c) => c.chatId === chatId
          );
          setClearedAt(currentChat?.clearedAt || 0);
        }
      }
    };

    fetchClearedTimestamp();
  }, [chatId, currentUser?.id]);

  const SDKAppID = 20014399;
  const SDKSecretKey =
    "d0168e98621b1e26651934dfa73756a18171e54a58ca7c709058847434411425";

  const [callerUserID, setCallerUserID] = useState("");
  const [calleeUserID, setCalleeUserID] = useState("");

  const init = async () => {
    const { userSig } = GenerateTestUserSig.genTestUserSig({
      userID: callerUserID,
      SDKAppID,
      SecretKey: SDKSecretKey,
    });
    await TUICallKitServer.init({
      userID: callerUserID,
      userSig,
      SDKAppID,
    });
    alert("TUICallKit init succeed");
  };

  const call = async () => {
    await TUICallKitServer.call({
      userID: calleeUserID,
      type: TUICallType.VIDEO_CALL,
    });
  };

  const voicecall = async () => {
    try {
      const enable = true;
      await TUICallKitServer.enableFloatWindow(enable);
    } catch (error) {
      console.error(
        `[TUICallKit] Failed to call the enableFloatWindow API. Reason: ${error}`
      );
    }

    const enable = true;
    TUICallKitServer.enableVirtualBackground(enable);

    await TUICallKitServer.call({
      userID: calleeUserID,
      type: TUICallType.AUDIO_CALL,
    });
  };

  const fun1 = async () => {
    init();
    voicecall();
  };
  const fun2 = async () => {
    init();
    call();
  };

  const handleEmoji = (e) => {
    console.log(e);
    setText((prev) => prev + e.emoji);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        message: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
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

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }

    setImg({
      file: null,
      url: "",
    });
    setText("");
  };

  return (
    <div className={`chat ${!showDetail ? 'expanded' : ''}`}>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{user?.status}</p>
          </div>
        </div>
        <div className="icons">
          <img onClick={fun1} src="./phone.png" alt="" />
          <img onClick={fun2} src="video.png" alt="" />
          <span 
            onClick={() => setShowDetail(prev => !prev)}
            className="menu-icon"
          >
            ☰
          </span>
        </div>
      </div>
      <div className="center">
        {chat?.message?.map((message) => {
          if (message.createdAt) {
            // Convert Firestore timestamp to milliseconds
            const messageTime =
              message.createdAt instanceof Timestamp
                ? message.createdAt.toMillis()
                : message.createdAt?.toDate().getTime();

            // Only show if message is after cleared time
            if (!clearedAt || messageTime > clearedAt) {
              return (
                <div
                  className={
                    message.senderId === currentUser?.id
                      ? "message own"
                      : "message"
                  }
                  key={messageTime}
                >
                  <div className="texts">
                    {message.img && <img src={message.img} alt="" />}
                    <p>{message.text}</p>
                  </div>
                </div>
              );
            }
          }
          return null;
        })}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      {isCurrentUserBlocked && (
        <div className="block-message">You have been blocked by this user</div>
      )}
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
            disabled={isCurrentUserBlocked}
          />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input
          type="text"
          value={text}
          placeholder="Type your message..."
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setopen((prev) => !prev)}
            style={{ opacity: isCurrentUserBlocked ? 0.5 : 1 }}
          />
          <div className="picker">
            <EmojiPicker
              open={open && !isCurrentUserBlocked}
              onEmojiClick={handleEmoji}
            />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked}
        >
          send
        </button>
      </div>
      <div className="call">
        <TUICallKit />
      </div>
    </div>
  );
};

export default Chat;
