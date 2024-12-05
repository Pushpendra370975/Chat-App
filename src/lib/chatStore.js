import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';
import { useUserStore } from './userStore'

export const useChatStore = create((set) => ({
  chatId: null,
  user:null,
  isCurrentUserBlocked:false,
  isReceiverBlocked:false,
  
  changeChat: (chatId,user)=>{
    const currentUser=useUserStore.getState().currentUser;

    // If current user is blocked by the other user
    if(user.blocked.includes(currentUser.id)){
      return set({
        chatId,
        user,  // Changed from null to user so we can still see info
        isCurrentUserBlocked:true,
        isReceiverBlocked:false,
      });
    }
    
    // If current user has blocked the other user
    else if(currentUser.blocked.includes(user.id)){
      return set({
        chatId,
        user,  // Changed from null to user
        isCurrentUserBlocked:false,
        isReceiverBlocked:true,
      });
    }
    else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked:false,
        isReceiverBlocked:false,
      });
    }
  },

  changeBlock:()=>{
    set(state=>({...state,isReceiverBlocked: !state.isReceiverBlocked}))
  },

}))