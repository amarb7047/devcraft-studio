import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isMock } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // MOCK SYSTEM STATE FOR DEVELOPMENT (When VITE_FIREBASE_API_KEY is not configured)
  const mockLogin = async (email, password) => {
    setLoading(true);
    // Determine role
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'amar@devcraft.studio';
    const role = (email === adminEmail || email === '7047310066@paytm') ? 'admin' : 'client';
    
    const mockUser = {
      uid: role === 'admin' ? 'mock-admin-uid' : 'mock-client-uid',
      email,
      displayName: role === 'admin' ? 'Amar Biswas' : 'Demo Client',
    };
    
    const mockProfile = {
      uid: mockUser.uid,
      name: role === 'admin' ? 'Amar Biswas' : 'Demo Client',
      email,
      phone: role === 'admin' ? '7047310066' : '9876543210',
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    localStorage.setItem('mock_profile', JSON.stringify(mockProfile));
    
    setCurrentUser(mockUser);
    setUserData(mockProfile);
    setLoading(false);
    return { user: mockUser };
  };

  const mockSignup = async (email, password, name, phone) => {
    setLoading(true);
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'amar@devcraft.studio';
    const role = (email === adminEmail || email === '7047310066@paytm') ? 'admin' : 'client';
    
    const mockUser = {
      uid: `mock-${Date.now()}`,
      email,
      displayName: name,
    };

    const mockProfile = {
      uid: mockUser.uid,
      name,
      email,
      phone,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    localStorage.setItem('mock_profile', JSON.stringify(mockProfile));

    setCurrentUser(mockUser);
    setUserData(mockProfile);
    setLoading(false);
    return { user: mockUser };
  };

  const mockLogout = async () => {
    setLoading(true);
    localStorage.removeItem('mock_user');
    localStorage.removeItem('mock_profile');
    setCurrentUser(null);
    setUserData(null);
    setLoading(false);
  };

  // REAL FIREBASE AUTH HANDLERS
  const signup = async (email, password, name, phone) => {
    if (isMock) {
      return mockSignup(email, password, name, phone);
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'amar@devcraft.studio';
      const role = (email === adminEmail || email === '7047310066@paytm') ? 'admin' : 'client';
      
      const profile = {
        uid: user.uid,
        name,
        email,
        phone,
        role,
        isActive: true,
        createdAt: serverTimestamp()
      };
      
      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), profile);
      return userCredential;
    } catch (error) {
      console.error("Firebase signup error:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    if (isMock) {
      return mockLogin(email, password);
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (isMock) {
      return mockLogout();
    }
    return signOut(auth);
  };

  useEffect(() => {
    if (isMock) {
      // Mock auth persistent listener
      const cachedUser = localStorage.getItem('mock_user');
      const cachedProfile = localStorage.getItem('mock_profile');
      if (cachedUser && cachedProfile) {
        setCurrentUser(JSON.parse(cachedUser));
        setUserData(JSON.parse(cachedProfile));
      }
      setLoading(false);
      return;
    }

    // Real Firebase auth listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.warn("User authenticated but profile not found in Firestore.");
            setUserData({
              uid: user.uid,
              email: user.email,
              role: 'client',
              name: user.displayName || 'Client User',
              phone: '',
              isActive: true
            });
          }
        } catch (error) {
          console.error("Error fetching user document from Firestore:", error);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    signup,
    logout,
    isAdmin: userData?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
