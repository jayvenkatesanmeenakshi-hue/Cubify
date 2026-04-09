import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { db, collection, doc, setDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp, writeBatch } from '../firebase';
import { MessageCircle, Users, UserPlus, Search, Send, Check, X, AlertCircle, Zap } from 'lucide-react';
import { generateScramble } from '../lib/cube';
import { Link } from 'react-router-dom';

interface SocialPageProps {
  user: User | null;
}

export const SocialPage: React.FC<SocialPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'requests' | 'add'>('messages');
  const [myFriendId, setMyFriendId] = useState<string>('');
  
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch my friend ID
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setMyFriendId(docSnap.data().friendId || '');
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch chats
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch requests
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'friend_requests'), where('to', '==', user.uid), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch active chat messages
  useEffect(() => {
    if (!activeChat) return;
    const q = query(collection(db, `chats/${activeChat.id}/messages`), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [activeChat]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = query(collection(db, 'users'), where('friendId', '==', searchQuery.trim()));
    const snap = await getDocs(q);
    setSearchResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const sendRequest = async (targetId: string) => {
    if (!user) return;
    try {
      await setDoc(doc(collection(db, 'friend_requests')), {
        from: user.uid,
        to: targetId,
        fromProfile: { displayName: user.displayName, photoURL: user.photoURL },
        status: 'pending',
        timestamp: serverTimestamp()
      });
      alert('Friend request sent!');
    } catch (e) {
      console.error(e);
      alert('Error sending request.');
    }
  };

  const acceptRequest = async (req: any) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      
      // Update request status
      batch.update(doc(db, 'friend_requests', req.id), { status: 'accepted' });
      
      // Create chat
      const chatRef = doc(collection(db, 'chats'));
      batch.set(chatRef, {
        participants: [user.uid, req.from],
        profiles: {
          [user.uid]: { displayName: user.displayName, photoURL: user.photoURL },
          [req.from]: req.fromProfile
        },
        updatedAt: serverTimestamp(),
        lastMessage: 'You are now friends!'
      });
      
      await batch.commit();
      setActiveTab('messages');
    } catch (e) {
      console.error(e);
      alert('Error accepting request.');
    }
  };

  const declineRequest = async (req: any) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'friend_requests', req.id), { status: 'rejected' });
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;
    
    const msgText = newMessage;
    setNewMessage('');
    
    try {
      const batch = writeBatch(db);
      const msgRef = doc(collection(db, `chats/${activeChat.id}/messages`));
      const chatRef = doc(db, 'chats', activeChat.id);
      
      batch.set(msgRef, {
        text: msgText,
        senderId: user.uid,
        timestamp: serverTimestamp()
      });
      
      batch.update(chatRef, {
        lastMessage: msgText,
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  const challengeRace = async () => {
    if (!activeChat || !user) return;
    
    const otherUserId = activeChat.participants.find((id: string) => id !== user.uid);
    const otherProfile = activeChat.profiles[otherUserId];
    
    try {
      const newMatchRef = doc(collection(db, 'matches'));
      const matchData = {
        scramble: generateScramble('3x3'),
        status: 'waiting',
        createdAt: serverTimestamp(),
        players: {
          [user.uid]: {
            displayName: user.displayName || 'Unknown',
            photoURL: user.photoURL || '',
            rank: 'UNRANKED',
            ready: false,
            time: null,
            state: 'idle'
          },
          [otherUserId]: {
            displayName: otherProfile?.displayName || 'Unknown',
            photoURL: otherProfile?.photoURL || '',
            rank: 'UNRANKED',
            ready: false,
            time: null,
            state: 'idle'
          }
        }
      };
      
      const batch = writeBatch(db);
      batch.set(newMatchRef, matchData);
      
      const msgRef = doc(collection(db, `chats/${activeChat.id}/messages`));
      const chatRef = doc(db, 'chats', activeChat.id);
      
      const msgText = `[RACE_CHALLENGE:${newMatchRef.id}]`;
      
      batch.set(msgRef, {
        text: msgText,
        senderId: user.uid,
        timestamp: serverTimestamp()
      });
      
      batch.update(chatRef, {
        lastMessage: 'Sent a race challenge!',
        updatedAt: serverTimestamp()
      });
      
      await batch.commit();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-slate-500">
        <AlertCircle className="w-16 h-16 mb-4 text-slate-300" />
        <h1 className="text-2xl font-bold text-slate-700 mb-2">Sign in Required</h1>
        <p>Please sign in to access messages and friends.</p>
      </div>
    );
  }

  return (
    <div className="h-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Left Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">{user.displayName}</h2>
              <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-mono text-slate-600 font-medium border border-slate-200">
                ID: {myFriendId || '...'}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setActiveTab('messages'); setActiveChat(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'messages' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Messages
              </button>
              <button 
                onClick={() => { setActiveTab('requests'); setActiveChat(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors relative ${activeTab === 'requests' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Requests
                {requests.length > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => { setActiveTab('add'); setActiveChat(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'add' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === 'messages' && (
              chats.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm">No messages yet.</div>
              ) : (
                chats.map(chat => {
                  const otherUserId = chat.participants.find((id: string) => id !== user.uid);
                  const otherProfile = chat.profiles[otherUserId];
                  return (
                    <button 
                      key={chat.id}
                      onClick={() => setActiveChat(chat)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${activeChat?.id === chat.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                    >
                      <img src={otherProfile?.photoURL} alt="" className="w-12 h-12 rounded-full bg-slate-200 object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{otherProfile?.displayName}</div>
                        <div className="text-sm text-slate-500 truncate">{chat.lastMessage}</div>
                      </div>
                    </button>
                  )
                })
              )
            )}

            {activeTab === 'requests' && (
              requests.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-sm">No pending requests.</div>
              ) : (
                requests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-2">
                    <div className="flex items-center gap-3">
                      <img src={req.fromProfile?.photoURL} alt="" className="w-10 h-10 rounded-full bg-slate-200 object-cover" referrerPolicy="no-referrer" />
                      <div className="font-medium text-slate-800 text-sm">{req.fromProfile?.displayName}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => acceptRequest(req)} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => declineRequest(req)} className="p-2 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'add' && (
              <div className="p-2">
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Enter 8-digit ID" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    maxLength={8}
                  />
                  <button type="submit" className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </form>

                {searchResults.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={res.photoURL} alt="" className="w-10 h-10 rounded-full bg-slate-200 object-cover" referrerPolicy="no-referrer" />
                      <div className="font-medium text-slate-800 text-sm">{res.displayName}</div>
                    </div>
                    {res.id !== user.uid && (
                      <button onClick={() => sendRequest(res.id)} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                        Add
                      </button>
                    )}
                  </div>
                ))}
                {searchResults.length === 0 && searchQuery && (
                  <div className="text-center text-sm text-slate-400 mt-4">Search for a friend's ID to add them.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Content Area (Chat) */}
        <div className={`flex-1 flex flex-col bg-slate-50 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <button className="md:hidden text-slate-500" onClick={() => setActiveChat(null)}>
                    <X className="w-6 h-6" />
                  </button>
                  {(() => {
                    const otherUserId = activeChat.participants.find((id: string) => id !== user.uid);
                    const otherProfile = activeChat.profiles[otherUserId];
                    return (
                      <>
                        <img src={otherProfile?.photoURL} alt="" className="w-10 h-10 rounded-full bg-slate-200 object-cover" referrerPolicy="no-referrer" />
                        <div className="font-bold text-slate-800">{otherProfile?.displayName}</div>
                      </>
                    );
                  })()}
                </div>
                <button 
                  onClick={challengeRace}
                  className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-900 text-[#00FF00] px-4 py-2 rounded-lg font-mono text-sm font-bold transition-colors border border-[#00FF00]/30 shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  RACE
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user.uid;
                  const isChallenge = msg.text.startsWith('[RACE_CHALLENGE:');
                  
                  if (isChallenge) {
                    const matchId = msg.text.replace('[RACE_CHALLENGE:', '').replace(']', '');
                    return (
                      <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 border-2 border-[#00FF00] bg-[#050505] text-[#00FF00] font-mono shadow-lg shadow-green-500/10`}>
                          <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-5 h-5" />
                            <span className="font-bold tracking-widest">{isMe ? 'CHALLENGE SENT' : 'RACE CHALLENGE'}</span>
                          </div>
                          <p className="text-sm opacity-80 mb-4">{isMe ? 'Waiting for opponent to join...' : 'You have been challenged to a speedcube race!'}</p>
                          <Link 
                            to={`/race?matchId=${matchId}`}
                            className="block w-full text-center bg-[#00FF00] text-black font-bold py-2 rounded hover:bg-[#00FF00]/90 transition-colors"
                          >
                            JOIN MATCH
                          </Link>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-slate-100 border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a chat or start a new conversation</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
