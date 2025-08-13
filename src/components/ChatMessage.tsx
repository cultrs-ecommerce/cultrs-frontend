import React from "react";
import { Message } from "../types/Chat";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isSender = message.senderId === user?.id;

  const renderContent = () => {
    switch (message.type) {
      case "text":
        return <p>{message.content.text}</p>;
      case "image":
        return (
          <img
            src={message.content.fileData}
            alt={message.content.fileName}
            className="max-w-xs rounded-lg"
          />
        );
      case "file":
        return (
          <a
            href={message.content.fileData}
            download={message.content.fileName}
            className="text-blue-500 underline"
          >
            {message.content.fileName}
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-md rounded-lg p-3 ${
          isSender ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        {renderContent()}
        <div style={{fontSize: "0.7rem"}} className="text-right text-gray-200 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
