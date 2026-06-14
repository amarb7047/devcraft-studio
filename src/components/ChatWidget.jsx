import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, isMock } from '../firebase/config';
import { collection, addDoc, query, where, orderBy, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { MessageSquare, X, Send, User, ChevronDown } from 'lucide-react';

const ChatWidget = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chats
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Mark admin messages as read when drawer is opened
      markMessagesAsRead();
    }
  }, [messages, isOpen]);

  // Read message thread in real-time
  useEffect(() => {
    if (!currentUser) {
      setMessages([]);
      setUnreadCount(0);
      return;
    }

    if (isMock) {
      // Setup mock chat database listener (using localStorage for persistence)
      const loadMockChats = () => {
        const stored = localStorage.getItem(`mock_chats_${currentUser.uid}`);
        const chatList = stored ? JSON.parse(stored) : [
          {
            id: 'welcome',
            userId: currentUser.uid,
            sender: 'admin',
            message: `Hi ${currentUser.displayName || 'there'}! Welcome to DevCraft Studio. How can I help you with your project today?`,
            isRead: true,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        setMessages(chatList);
        
        // Count unread admin messages
        const unread = chatList.filter(m => m.sender === 'admin' && !m.isRead).length;
        setUnreadCount(unread);
      };

      loadMockChats();
      window.addEventListener('storage', loadMockChats);
      // Listen for mock custom updates
      const interval = setInterval(loadMockChats, 1000);
      return () => {
        window.removeEventListener('storage', loadMockChats);
        clearInterval(interval);
      };
    }

    // Real Firebase Chat Thread Listener
    const chatsQuery = query(
      collection(db, 'chats'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatList = [];
      let unread = 0;
      
      snapshot.forEach((doc) => {
        const msg = doc.data();
        chatList.push({ id: doc.id, ...msg });
        if (msg.sender === 'admin' && !msg.isRead) {
          unread++;
        }
      });
      
      setMessages(chatList);
      setUnreadCount(isOpen ? 0 : unread);
    }, (error) => {
      console.error("Error loading chat messages:", error);
    });

    return unsubscribe;
  }, [currentUser, isOpen]);

  // Mark admin messages as read
  const markMessagesAsRead = async () => {
    if (!currentUser || messages.length === 0) return;

    const unreadMsgs = messages.filter(m => m.sender === 'admin' && !m.isRead);
    if (unreadMsgs.length === 0) return;

    if (isMock) {
      const stored = localStorage.getItem(`mock_chats_${currentUser.uid}`);
      if (stored) {
        const chatList = JSON.parse(stored);
        const updated = chatList.map(m => m.sender === 'admin' ? { ...m, isRead: true } : m);
        localStorage.setItem(`mock_chats_${currentUser.uid}`, JSON.stringify(updated));
      }
      setUnreadCount(0);
      return;
    }

    try {
      const batch = writeBatch(db);
      unreadMsgs.forEach((msg) => {
        const msgRef = doc(db, 'chats', msg.id);
        batch.update(msgRef, { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const text = inputText.trim();
    setInputText('');

    if (isMock) {
      // Send Client Message Mock
      const stored = localStorage.getItem(`mock_chats_${currentUser.uid}`);
      const chatList = stored ? JSON.parse(stored) : [];
      
      const newClientMsg = {
        id: `mock-msg-${Date.now()}`,
        userId: currentUser.uid,
        sender: 'client',
        message: text,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      const updatedList = [...chatList, newClientMsg];
      localStorage.setItem(`mock_chats_${currentUser.uid}`, JSON.stringify(updatedList));
      setMessages(updatedList);
      scrollToBottom();

      // Trigger automatic Mock Admin Reply after 1.5s
      setTimeout(() => {
        const currentStored = localStorage.getItem(`mock_chats_${currentUser.uid}`);
        const currentList = currentStored ? JSON.parse(currentStored) : [];
        
        // Sample dynamic replies
        const replies = [
          "Thank you for reaching out! Amar Biswas is reviewing your message and will reply shortly.",
          "Got it! That sounds like an interesting project. Could you share more details about your timeline and budget?",
          "Awesome. Feel free to also fill out our '/order' form with detailed specifications, and we'll prepare a custom quote for you!",
          "Yes, we develop custom React and Node apps! Let me know if you need full-stack features.",
          "I will notify Amar right away. You can also directly call him at 7047310066."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const adminReply = {
          id: `mock-msg-${Date.now() + 1}`,
          userId: currentUser.uid,
          sender: 'admin',
          message: randomReply,
          isRead: isOpen, // If widget is open, mark read immediately
          createdAt: new Date().toISOString()
        };

        const finalUpdatedList = [...currentList, adminReply];
        localStorage.setItem(`mock_chats_${currentUser.uid}`, JSON.stringify(finalUpdatedList));
        setMessages(finalUpdatedList);
        scrollToBottom();
      }, 1500);

      return;
    }

    try {
      await addDoc(collection(db, 'chats'), {
        userId: currentUser.uid,
        sender: 'client',
        message: text,
        isRead: false,
        createdAt: new Date() // Firestore timestamp helper will be formatted on server
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const toggleWidget = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsOpen(!isOpen);
  };

  // Do not render floating chat widget on admin layout routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Box Drawer */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-premium border border-gray-100 flex flex-col overflow-hidden mb-4 transition-all duration-300 transform scale-100 origin-bottom-right">
          
          {/* Header */}
          <div className="bg-primary-600 px-6 py-4 flex items-center justify-between text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Amar Biswas</span>
                <span className="text-[10px] text-primary-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>Online Support</span>
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages List Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {messages.map((msg) => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isAdmin 
                      ? 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100' 
                      : 'bg-primary-600 text-white rounded-tr-none shadow-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <span className={`text-[9px] block text-right mt-1 ${
                      isAdmin ? 'text-gray-400' : 'text-primary-200'
                    }`}>
                      {new Date(msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600 text-white transition-all shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={toggleWidget}
        className="w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-premium transition-transform hover:scale-105 active:scale-95 focus:outline-none relative group"
        title={currentUser ? "Chat with Developer" : "Log in to chat"}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:rotate-6 transition-transform" />}
        
        {/* Unread Message Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-6 w-6 rounded-full border-2 border-white flex items-center justify-center animate-pulse-subtle">
            {unreadCount}
          </span>
        )}
      </button>

    </div>
  );
};

export default ChatWidget;
