import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { db, collection, doc, setDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp, writeBatch } from '../firebase';
import { MessageCircle, Users, UserPlus, Search, Send, Check, X, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

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
      toast.success('Communication request dispatched.');
    } catch (e) {
      console.error(e);
      toast.error('Dispatch failure.');
    }
  };

  const acceptRequest = async (req: any) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'friend_requests', req.id), { status: 'accepted' });
      const chatRef = doc(collection(db, 'chats'));
      batch.set(chatRef, {
        participants: [user.uid, req.from],
        profiles: {
          [user.uid]: { displayName: user.displayName, photoURL: user.photoURL },
          [req.from]: req.fromProfile
        },
        updatedAt: serverTimestamp(),
        lastMessage: 'Synchronized with StarVortex Identity.'
      });
      await batch.commit();
      setActiveTab('messages');
    } catch (e) {
      console.error(e);
      toast.error('Synchronization failure.');
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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-500 font-mono tracking-widest uppercase">
        <Shield className="w-16 h-16 mb-6 text-slate-800" />
        <h1 className="text-xl font-black text-white mb-2">Protocol Unauthorized</h1>
        <p className="text-sm">Please identify with StarVortex Passport.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl h-[calc(100vh-120px)] flex flex-col">
        <header className="flex items-center justify-between mb-8">
           <Link to="/" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all border border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          <div className="text-center flex-1">
             <h1 className="text-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
              <MessageCircle className="w-6 h-6 text-indigo-500" /> Comm Stream
             </h1>
             <div className="text-[10px] font-black font-mono text-slate-500 tracking-[0.2em] mt-1 uppercase">Secure Neural Intersection</div>
          </div>
          <div className="hidden md:block w-9" /> {/* Spacer */}
        </header>

        <div className="flex-1 flex bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl overflow-hidden">
          {/* Left Sidebar */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 border-b border-white/10 space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-[12px] font-black text-indigo-400 uppercase tracking-widest">{user.displayName}</div>
                <div className="bg-indigo-500/10 px-3 py-1 rounded-full text-[10px] font-black text-indigo-400 border border-indigo-500/20 uppercase">
                  ID: {myFriendId}
                </div>
              </div>
              <div className="flex gap-2">
                {['messages', 'requests', 'add'].map((tab: any) => (
                  <button 
                    key={tab}
                    onClick={() => { setActiveTab(tab); setActiveChat(null); }}
                    className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border ${activeTab === tab ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                  >
                    {tab}
                    {tab === 'requests' && requests.length > 0 && <span className="ml-1 text-red-500">•</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'messages' && (
                chats.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 font-mono text-[10px] tracking-widest">NO ACTIVE STREAMS</div>
                ) : (
                  chats.map(chat => {
                    const otherUserId = chat.participants.find((id: string) => id !== user.uid);
                    const otherProfile = chat.profiles[otherUserId];
                    const isActive = activeChat?.id === chat.id;
                    return (
                      <button 
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all text-left mb-2 group ${isActive ? 'bg-indigo-600/20 border border-indigo-600/30' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                        <img src={otherProfile?.photoURL} alt="" className="w-12 h-12 rounded-2xl bg-white/5 object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <div className={`font-black text-sm uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>{otherProfile?.displayName}</div>
                          <div className="text-[10px] text-slate-500 truncate font-medium mt-0.5 uppercase tracking-tighter">{chat.lastMessage}</div>
                        </div>
                      </button>
                    )
                  })
                )
              )}

              {activeTab === 'requests' && (
                requests.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 font-mono text-[10px] tracking-widest text-center">PENDING QUEUE EMPTY</div>
                ) : (
                  requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-3xl mb-3">
                      <div className="flex items-center gap-3">
                        <img src={req.fromProfile?.photoURL} alt="" className="w-10 h-10 rounded-xl bg-white/5 object-cover border border-white/10" referrerPolicy="no-referrer" />
                        <div className="font-black text-[12px] text-slate-300 uppercase tracking-tight">{req.fromProfile?.displayName}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => acceptRequest(req)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => declineRequest(req)} className="p-2 bg-white/10 text-slate-400 rounded-xl hover:bg-white/20 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === 'add' && (
                <div className="space-y-6">
                  <form onSubmit={handleSearch} className="relative">
                    <input 
                      type="text" 
                      placeholder="ENTER NEURAL ID..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-[10px] font-black font-mono focus:ring-1 focus:ring-indigo-500 outline-none text-white tracking-[0.2em]"
                      maxLength={8}
                    />
                    <button type="submit" className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500">
                      <Search className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="space-y-2">
                    {searchResults.map(res => (
                      <div key={res.id} className="flex items-center justify-between p-4 bg-indigo-600/5 border border-indigo-600/10 rounded-3xl">
                        <div className="flex items-center gap-3">
                          <img src={res.photoURL} alt="" className="w-10 h-10 rounded-xl bg-white/5 object-cover border border-white/10" referrerPolicy="no-referrer" />
                          <div className="font-black text-[11px] text-slate-300 uppercase tracking-widest">{res.displayName}</div>
                        </div>
                        {res.id !== user.uid && (
                          <button onClick={() => sendRequest(res.id)} className="text-[9px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-indigo-500 transition-all">
                            Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Chat Area */}
          <div className={`flex-1 flex flex-col bg-slate-900/30 backdrop-blur-sm ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
            {activeChat ? (
              <>
                <div className="h-20 border-b border-white/10 bg-white/5 flex items-center px-8 gap-4 justify-between backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <button className="md:hidden text-slate-400 p-2 bg-white/5 rounded-lg mr-2" onClick={() => setActiveChat(null)}>
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    {(() => {
                      const otherUserId = activeChat.participants.find((id: string) => id !== user.uid);
                      const otherProfile = activeChat.profiles[otherUserId];
                      return (
                        <>
                          <img src={otherProfile?.photoURL} alt="" className="w-12 h-12 rounded-2xl bg-white/5 object-cover border border-white/10" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-black text-white uppercase tracking-widest text-lg italic">{otherProfile?.displayName}</div>
                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Encrypted Link Active
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-gradient-to-b from-indigo-500/5 to-transparent">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.uid;
                    return (
                      <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-5 py-3 rounded-2xl relative shadow-2xl ${isMe ? 'bg-indigo-600 text-white rounded-br-[2px]' : 'bg-white/10 text-white border border-white/10 rounded-bl-[2px] backdrop-blur-sm'}`}>
                          <p className="text-sm font-medium leading-relaxed tracking-tight">{msg.text}</p>
                          <div className={`absolute bottom-[-18px] text-[8px] font-black font-mono text-slate-600 uppercase tracking-widest ${isMe ? 'right-0' : 'left-0'}`}>
                            {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-8 bg-white/5 border-t border-white/10 backdrop-blur-md">
                  <form onSubmit={sendMessage} className="relative flex items-center">
                    <input 
                      type="text" 
                      placeholder="ENTER NEURAL PACKET..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 outline-none text-white backdrop-blur-md placeholder:text-slate-600"
                    />
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="absolute right-2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-700 font-mono text-[10px] tracking-[0.4em] uppercase">
                <div className="w-24 h-24 border border-white/5 rounded-full flex items-center justify-center mb-8 bg-white/2">
                   <MessageCircle className="w-10 h-10 opacity-10" />
                </div>
                SECURE STREAM WAITING...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

