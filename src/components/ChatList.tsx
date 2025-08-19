import React, { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "../firebaseConfig";
import { Chat } from "../types/Chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface ChatListItem extends Chat {
  id: string;
}

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const userChatsRef = ref(database, `userChats/${user.id}`);
    let chatListeners: { ref: any; listener: any }[] = [];

    const userChatsListener = onValue(userChatsRef, (snapshot) => {
      const userChatsData = snapshot.val();
      if (!userChatsData) {
        setChats([]);
        return;
      }

      chatListeners.forEach(({ ref, listener }) => off(ref, "value", listener));
      chatListeners = [];

      const chatIds = Object.values(userChatsData).map(
        (chat: any) => chat.chatId
      );

      const newChats: ChatListItem[] = [];
      let processedCount = 0;

      if (chatIds.length === 0) {
        setChats([]);
        return;
      }

      chatIds.forEach((chatId: string) => {
        const chatRef = ref(database, `chats/${chatId}/metadata`);
        const chatListener = onValue(chatRef, (chatSnapshot) => {
          const chatData = chatSnapshot.val();
          if (chatData) {
            const existingChatIndex = newChats.findIndex(
              (c) => c.id === chatId
            );
            const newChatData = { id: chatId, ...chatData };

            if (existingChatIndex > -1) {
              newChats[existingChatIndex] = newChatData;
            } else {
              newChats.push(newChatData);
            }
          }

          processedCount++;
          if (processedCount === chatIds.length) {
            setChats([...newChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime)]);
          }
        });
        chatListeners.push({ ref: chatRef, listener: chatListener });
      });
    });

    return () => {
      off(userChatsRef, "value", userChatsListener);
      chatListeners.forEach(({ ref, listener }) => off(ref, "value", listener));
    };
  }, [user]);

  const getOtherParticipantInfo = (chat: Chat) => {
    if (!user) return { id: null, name: null, avatar: null };
    const otherUserId = chat.participants.find((p) => p !== user.id);
    const otherUserIndex = chat.participants.findIndex((p) => p === otherUserId);
    const otherUserName = chat.participantNames[otherUserIndex];
    // const otherUserAvatar = chat.participantAvatars[otherUserIndex];

    return { id: otherUserId, name: otherUserName };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent>
        {chats.length > 0 ? (
          <div className="space-y-2">
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipantInfo(chat);
              const isSelected = chat.id === selectedChatId;
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar>
                      <AvatarImage src={otherParticipant.avatar} alt="User" />
                      <AvatarFallback>
                        {otherParticipant.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{otherParticipant.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                  {chat.lastMessageTime && (
                    <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p>No conversations yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatList;