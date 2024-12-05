import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    console.log("fetchUserInfo started with uid:", uid);
    if (!uid) {
      console.log("No UID, setting currentUser to null");
      return set({ currentUser: null, isLoading: false });
    }
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("Setting currentUser with data:", userData);
        set({ currentUser: userData, isLoading: false });
      } else {
        console.log("No user document found");
        set({ currentUser: null, isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      set({ currentUser: null, isLoading: false });
    }
  }
}));