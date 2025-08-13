import React, { useState } from "react";
import ChatList from "../components/ChatList";
import ChatView from "./ChatView";
import { useIsMobile } from "../hooks/use-mobile";

const ChatPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  if (isMobile) {
    return (
      <div className="h-screen">
        {selectedChatId ? (
          <ChatView chatId={selectedChatId} onBack={handleBackToList} />
        ) : (
          <div className="p-4">
            <ChatList onSelectChat={handleSelectChat} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r overflow-y-auto p-4 h-90">
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
        />
      </div>
      <div className="w-3/4 flex flex-col">
        {selectedChatId ? (
          <ChatView chatId={selectedChatId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
