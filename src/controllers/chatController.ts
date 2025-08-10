import {
  ref,
  set,
  push,
  serverTimestamp,
  update,
  increment,
  get,
} from "firebase/database";
import { database, db } from "../firebaseConfig";
import { Message } from "../types/Chat";
import { doc, getDoc } from "firebase/firestore";

/**
 * Generates a consistent chat ID for two users.
 * @param userId1 - The first user's ID.
 * @param userId2 - The second user's ID.
 * @returns The generated chat ID.
 */
const generateChatId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join("_");
};

/**
 * Creates a new chat between two users if it doesn't already exist.
 * @param userId1 - The first user's ID.
 * @param userId2 - The second user's ID.
 * @returns The ID of the created or existing chat.
 */
export const createChat = async (
  userId1: string,
  userId2: string
): Promise<string> => {
  const chatId = generateChatId(userId1, userId2);
  const chatRef = ref(database, `chats/${chatId}`);
  const userChatsRef1 = ref(database, `userChats/${userId1}/${userId2}`);
  const userChatsRef2 = ref(database, `userChats/${userId2}/${userId1}`);

  const chatSnapshot = await get(chatRef);

  if (!chatSnapshot.exists()) {
    const user1Doc = await getDoc(doc(db, "users", userId1));
    const user2Doc = await getDoc(doc(db, "users", userId2));

    const user1Name = user1Doc.data()?.name || "Unknown User";
    const user2Name = user2Doc.data()?.name || "Unknown User";

    const chatMetadata = {
      participants: [userId1, userId2],
      participantNames: [user1Name, user2Name],
      createdAt: serverTimestamp(),
      lastMessage: "Chat created",
      lastMessageTime: serverTimestamp(),
      lastMessageSender: "",
      [`unreadCount_${userId1}`]: 0,
      [`unreadCount_${userId2}`]: 0,
    };

    await set(ref(database, `chats/${chatId}/metadata`), chatMetadata);
    await set(userChatsRef1, { chatId });
    await set(userChatsRef2, { chatId });
  }

  return chatId;
};

/**
 * Sends a message in a chat.
 * @param chatId - The ID of the chat.
 * @param senderId - The ID of the message sender.
 * @param recipientId - The ID of the message recipient.
 * @param message - The message object.
 */
export const sendMessage = async (
  chatId: string,
  senderId: string,
  recipientId: string,
  message: Omit<Message, "id" | "timestamp" | "senderId" | "status">
) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);

  const messageData = {
    ...message,
    senderId,
    timestamp: serverTimestamp(),
    status: "sent",
  };

  await set(newMessageRef, messageData);

  const metadataRef = ref(database, `chats/${chatId}/metadata`);
  let lastMessagePreview = "";

  if (message.type === "text") {
    lastMessagePreview = message.content.text?.substring(0, 50) || "";
  } else if (message.type === "image") {
    lastMessagePreview = "Photo";
  } else if (message.type === "file") {
    lastMessagePreview = "File";
  }

  const metadataUpdate = {
    lastMessage: lastMessagePreview,
    lastMessageTime: serverTimestamp(),
    lastMessageSender: senderId,
    [`unreadCount_${recipientId}`]: increment(1),
  };

  await update(metadataRef, metadataUpdate);
};

/**
 * Marks messages in a chat as read by a user.
 * @param chatId - The ID of the chat.
 * @param userId - The ID of the user reading the messages.
 */
export const markMessagesAsRead = async (chatId: string, userId: string) => {
  const metadataRef = ref(database, `chats/${chatId}/metadata`);
  await update(metadataRef, {
    [`unreadCount_${userId}`]: 0,
  });

  const participants = chatId.split("_");
  const otherUserId = participants.find((id) => id !== userId);

  if (otherUserId) {
    const userChatRef = ref(database, `userChats/${userId}/${otherUserId}`);
    await update(userChatRef, {
      lastSeen: serverTimestamp(),
    });
  }
};
