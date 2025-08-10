export interface Chat {
  id: string;
  participants: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: number;
  lastMessageSender: string;
  unreadCount: { [key: string]: number };
}

export interface Message {
  id: string;
  senderId: string;
  timestamp: number;
  type: "text" | "image" | "file";
  content: {
    text?: string;
    fileName?: string;
    fileData?: string;
    fileSize?: number;
    mimeType?: string;
  };
  status: "sent" | "delivered" | "read";
}
