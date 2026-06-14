import React, { useState, useEffect, useRef } from 'react';
import { db, isMock } from '../../firebase/config';
import { collection, onSnapshot, query, orderBy, addDoc, writeBatch, doc, getDocs } from 'firebase/firestore';
import { MessageSquare, Send, User, ChevronRight, CheckCheck, Inbox } from 'lucide-react';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of active conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load registered users list to resolve names
  useEffect(() => {
    if (isMock) {
      setUsersMap({
        'mock-client-uid': { name: 'Demo Client', email: 'client@example.com', phone: '9876543210' }
      });
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const map = {};
      snapshot.forEach(docSnap => {
        map[docSnap.id] = docSnap.data();
      });
      setUsersMap(map);
    });

    return unsubscribe;
  }, []);

  // Listen to all chat messages to aggregate conversations
  useEffect(() => {
    if (isMock) {
      // Mock chat threads load
      const loadMockConversations = () => {
        const stored = localStorage.getItem(`mock_chats_mock-client-uid`);
        const chatList = stored ? JSON.parse(stored) : [
          {
            id: 'welcome',
            userId: 'mock-client-uid',
            sender: 'admin',
            message: "Hi there! Welcome to DevCraft Studio. How can I help you with your project today?",
            isRead: true,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        
        // Count unread client messages
        const unreadCount = chatList.filter(m => m.sender === 'client' && !m.isRead).length;
        const lastMsg = chatList[chatList.length - 1];

        setConversations([
          {
            userId: 'mock-client-uid',
            clientName: 'Demo Client',
            clientEmail: 'client@example.com',
            lastMessage: lastMsg?.message || '',
            lastMessageTime: lastMsg?.createdAt || new Date().toISOString(),
            unreadCount
          }
        ]);
        
        if (selectedUserId === 'mock-client-uid') {
          setMessages(chatList);
        }
        setLoading(false);
      };

      loadMockConversations();
      const interval = setInterval(loadMockConversations, 1000);
      return () => clearInterval(interval);
    }

    // Real Firebase listener on all chats
    const chatsQuery = query(collection(db, 'chats'), orderBy('createdAt', 'asc'));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const allMsgs = [];
      const userThreads = {};

      snapshot.forEach((docSnap) => {
        const msg = { id: docSnap.id, ...docSnap.data() };
        allMsgs.push(msg);

        const uid = msg.userId;
        if (!uid) return;

        if (!userThreads[uid]) {
          userThreads[uid] = {
            userId: uid,
            messages: [],
            unreadCount: 0
          };
        }
        userThreads[uid].messages.push(msg);
        if (msg.sender === 'client' && !msg.isRead) {
          userThreads[uid].unreadCount++;
        }
      });

      // Build conversations summary list
      const summaryList = Object.values(userThreads).map(thread => {
        const lastMsg = thread.messages[thread.messages.length - 1];
        const clientProfile = usersMap[thread.userId] || { name: 'Anonymous Client', email: 'N/A' };
        
        return {
          userId: thread.userId,
          clientName: clientProfile.name,
          clientEmail: clientProfile.email,
          lastMessage: lastMsg?.message || '',
          lastMessageTime: lastMsg?.createdAt?.seconds ? lastMsg.createdAt.seconds * 1000 : lastMsg?.createdAt || Date.now(),
          unreadCount: thread.unreadCount
        };
      });

      // Sort by latest message timestamp descending
      summaryList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      setConversations(summaryList);

      // Update active conversation window if selected
      if (selectedUserId && userThreads[selectedUserId]) {
        setMessages(userThreads[selectedUserId].messages);
      } else {
        setMessages([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading admin chats:", error);
      setLoading(false);
    });

    return unsubscribeChats;
  }, [selectedUserId, usersMap]);

  // Load chat messages when a conversation is selected and mark client messages as read
  const handleSelectConversation = async (userId) => {
    setSelectedUserId(userId);
    
    // Mark as read
    if (isMock) {
      const stored = localStorage.getItem(`mock_chats_${userId}`);
      if (stored) {
        const chatList = JSON.parse(stored);
        const updated = chatList.map(m => m.sender === 'client' ? { ...m, isRead: true } : m);
        localStorage.setItem(`mock_chats_${userId}`, JSON.stringify(updated));
      }
      return;
    }

    try {
      // Query unread messages in this thread
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', userId),
        where('sender', '==', 'client'),
        where('isRead', '==', false)
      );
      const snap = await getDocs(q);
      if (snap.size > 0) {
        const batch = writeBatch(db);
        snap.forEach(msgDoc => {
          batch.update(doc(db, 'chats', msgDoc.id), { isRead: true });
        });
        await batch.commit();
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId) return;

    const text = inputText.trim();
    setInputText('');

    if (isMock) {
      // Save Admin Message Mock
      const stored = localStorage.getItem(`mock_chats_${selectedUserId}`);
      const chatList = stored ? JSON.parse(stored) : [];
      
      const newAdminMsg = {
        id: `mock-msg-${Date.now()}`,
        userId: selectedUserId,
        sender: 'admin',
        message: text,
        isRead: true, // Marked read by client drawer if open
        createdAt: new Date().toISOString()
      };
      
      const updatedList = [...chatList, newAdminMsg];
      localStorage.setItem(`mock_chats_${selectedUserId}`, JSON.stringify(updatedList));
      setMessages(updatedList);
      scrollToBottom();
      return;
    }

    try {
      await addDoc(collection(db, 'chats'), {
        userId: selectedUserId,
        sender: 'admin',
        message: text,
        isRead: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error sending admin chat reply:", error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl h-[calc(100vh-12rem)] flex overflow-hidden shadow-soft">
      
      {/* Left Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">Client Conversations</span>
        </div>

        <div className="flex-grow overflow-y-auto divide-y divide-gray-50">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-400 space-y-1">
              <Inbox size={24} className="mx-auto text-gray-300" />
              <p className="text-xs">No active chats found.</p>
            </div>
          ) : (
            conversations.map((convo) => {
              const isActive = selectedUserId === convo.userId;
              return (
                <button
                  key={convo.userId}
                  onClick={() => handleSelectConversation(convo.userId)}
                  className={`w-full text-left p-4 flex items-center justify-between gap-3 border-l-4 transition-all ${
                    isActive 
                      ? 'bg-primary-50/30 border-primary-600' 
                      : 'border-transparent hover:bg-gray-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {convo.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-gray-800 text-xs sm:text-sm truncate">{convo.clientName}</span>
                      <p className="text-gray-400 text-[10px] sm:text-xs truncate font-medium">
                        {convo.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[9px] text-gray-400 font-mono">
                      {new Date(convo.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {convo.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Message Box Window */}
      <div className="flex-grow flex flex-col h-full bg-gray-50/30">
        {selectedUserId ? (
          <>
            {/* Thread Header */}
            <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                  {conversations.find(c => c.userId === selectedUserId)?.clientName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-xs sm:text-sm">
                    {conversations.find(c => c.userId === selectedUserId)?.clientName}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {conversations.find(c => c.userId === selectedUserId)?.clientEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAdmin 
                        ? 'bg-primary-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-150 shadow-sm'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <span className={`text-[8.5px] block text-right mt-1 ${
                        isAdmin ? 'text-primary-200' : 'text-gray-400'
                      }`}>
                        {new Date(msg.createdAt?.seconds ? msg.createdAt.seconds * 1000 : msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
              <input
                type="text"
                placeholder="Type your reply..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-800"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600 text-white transition-all shadow-sm shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center gap-2 p-8 text-gray-400 text-center h-full">
            <MessageSquare size={48} className="text-gray-300" />
            <h3 className="font-display font-bold text-gray-700 text-base">Select a Thread</h3>
            <p className="text-xs max-w-xs leading-normal">
              Click a client conversation from the left sidebar to view messages and coordinate order quotes.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
