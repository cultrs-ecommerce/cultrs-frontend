import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ref, onValue, off } from "firebase/database";
import { database, auth } from "../firebaseConfig";
import { Chat } from "../types/Chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

interface ChatListItem extends Chat {
  id: string;
}

const ChatList: React.FC = () => {
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

      // Clean up old listeners before creating new ones
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
            setChats([...newChats]);
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
    if (!user) return { id: null, name: null };
    const otherUserId = chat.participants.find((p) => p !== user.id);
    const otherUserName =
      chat.participantNames[
        chat.participants.findIndex((p) => p === otherUserId)
      ];
    return { id: otherUserId, name: otherUserName };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversations</CardTitle>
      </CardHeader>
      <CardContent>
        {chats.length > 0 ? (
          <div className="space-y-4">
            {chats.map((chat) => {
              const otherParticipant = getOtherParticipantInfo(chat);
              return (
                <Link to={`/chat/${chat.id}`} key={chat.id}>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="" alt="User" />
                        <AvatarFallback>
                          {otherParticipant.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{otherParticipant.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                    {chat.lastMessageTime && (
                      <div className="text-xs text-gray-400">
                        {new Date(chat.lastMessageTime).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </Link>
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
