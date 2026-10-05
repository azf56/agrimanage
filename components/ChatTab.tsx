import React, { useState } from 'react';
import { Message, Owner, User } from '../types';
import { MessageSquare, Send, User as UserIcon, CheckCheck, Clock, Phone } from 'lucide-react';

interface ChatTabProps {
  messages: Message[];
  setMessages: (data: Message[] | ((prev: Message[]) => Message[])) => void;
  owners: Owner[];
  user: User | null;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  setMessages,
  owners,
  user
}) => {
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(owners[0]?.id || '1');
  const [inputText, setInputText] = useState('');

  const selectedOwner = owners.find(o => o.id === selectedOwnerId) || owners[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      ownerId: selectedOwnerId,
      senderRole: user?.role || 'expert',
      senderId: user?.id || '1',
      senderName: user?.name || 'کارشناس سامانه',
      text: inputText.trim(),
      createdAt: 'امروز ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const filteredMessages = messages.filter(m => m.ownerId === selectedOwnerId);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[580px]">
      {/* Owners List Sidebar */}
      <div className="border-l border-gray-100 bg-gray-50/50 p-4 flex flex-col">
        <h3 className="font-black text-gray-800 text-sm mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-700" />
          گفتگو با باغداران
        </h3>

        <div className="space-y-2 overflow-y-auto flex-1">
          {owners.map(owner => {
            const ownerMsgCount = messages.filter(m => m.ownerId === owner.id).length;
            const isSelected = owner.id === selectedOwnerId;

            return (
              <div
                key={owner.id}
                onClick={() => setSelectedOwnerId(owner.id)}
                className={`p-3 rounded-2xl cursor-pointer transition flex items-center justify-between ${
                  isSelected ? 'bg-emerald-700 text-white shadow-md' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {owner.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-black text-xs">{owner.name}</h4>
                    <p className={`text-[10px] font-mono ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{owner.mobile}</p>
                  </div>
                </div>

                {ownerMsgCount > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white text-emerald-800' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {ownerMsgCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="md:col-span-2 flex flex-col justify-between p-4 md:p-6 bg-white">
        {/* Chat Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
          <div>
            <h3 className="font-black text-gray-800 text-base">{selectedOwner?.name || 'گفتگو'}</h3>
            <p className="text-xs text-gray-500 font-mono flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-600" /> {selectedOwner?.mobile}
            </p>
          </div>

          <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
            ارتباط مستقیم و پشتیبانی
          </span>
        </div>

        {/* Message Bubble Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 pl-2 my-2 max-h-[380px]">
          {filteredMessages.map(msg => {
            const isMe = msg.senderId === user?.id || (user?.role !== 'farmer' && msg.senderRole !== 'farmer');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs ${
                  isMe
                    ? 'bg-emerald-800 text-white rounded-tr-sm shadow-sm'
                    : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200'
                }`}>
                  <div className="text-[10px] opacity-75 font-bold mb-1">
                    {msg.senderName || (msg.senderRole === 'farmer' ? 'باغدار' : 'کارشناس')}
                  </div>
                  <p className="leading-relaxed font-medium">{msg.text}</p>
                  <div className="text-[9px] opacity-60 text-left mt-1 font-mono flex items-center justify-end gap-1">
                    {msg.createdAt}
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMessages.length === 0 && (
            <div className="py-20 text-center text-gray-400 text-xs">
              پیامی در این گفتگو ثبت نشده است. می‌توانید اولین پیام را ارسال کنید.
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="pt-4 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            placeholder="پیام یا توصیه خود را بنویسید..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-md transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> ارسال
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChatTab;
