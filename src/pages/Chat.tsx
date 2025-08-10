import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ref, onValue, off } from "firebase/database";
import { database, auth } from "../firebaseConfig";
import { sendMessage, markMessagesAsRead } from "../controllers/chatController";
import { Message, Chat } from "../types/Chat";
import ChatMessage from "../components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatMetadata, setChatMetadata] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!chatId || !user) return;

    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const metadataRef = ref(database, `chats/${chatId}/metadata`);

    const messagesListener = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      const loadedMessages: Message[] = [];
      for (const key in messagesData) {
        loadedMessages.push({ id: key, ...messagesData[key] });
      }
      setMessages(loadedMessages);
    });

    const metadataListener = onValue(metadataRef, (snapshot) => {
      const metadata = snapshot.val();
      setChatMetadata(metadata);
      if (metadata) {
        markMessagesAsRead(chatId, user.id);
      }
    });

    return () => {
      off(messagesRef, "value", messagesListener);
      off(metadataRef, "value", metadataListener);
    };
  }, [chatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!chatId || !user || newMessage.trim() === "") return;

    const recipientId = chatMetadata?.participants.find((p) => p !== user.id);
    if (!recipientId) return;

    await sendMessage(chatId, user.id, recipientId, {
      type: "text",
      content: { text: newMessage },
    });
    setNewMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId || !user) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileData = event.target?.result as string;
      const recipientId = chatMetadata?.participants.find(
        (p) => p !== user.id
      );
      if (!recipientId) return;

      await sendMessage(chatId, user.id, recipientId, {
        type: file.type.startsWith("image/") ? "image" : "file",
        content: {
          fileName: file.name,
          fileData,
          fileSize: file.size,
          mimeType: file.type,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const getOtherParticipantName = () => {
    if (!chatMetadata || !user) return "...";
    const otherUserIndex = chatMetadata.participants.findIndex(
      (p) => p !== user.id
    );
    return chatMetadata.participantNames[otherUserIndex] || "Unknown User";
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-100 p-4 border-b">
        <h1 className="text-xl font-semibold">
          Chat with {getOtherParticipantName()}
        </h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </main>
      <footer className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>Send</Button>
          <Button asChild variant="outline" size="icon">
            <label htmlFor="file-upload">
              <Paperclip className="h-4 w-4" />
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileUpload}
              />
            </label>
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;
