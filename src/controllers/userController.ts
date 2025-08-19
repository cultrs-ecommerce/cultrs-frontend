import { db, auth } from "../firebaseConfig";
import {
  doc,
  setDoc,
  Timestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import { User } from "@/types/User";

export const createUser = async (
  uid: string,
  email: string,
  name: string,
  zipCode?: number
): Promise<void> => {
  const newUser: Omit<User, "id"> = {
    email,
    name,
    listedProducts: [],
    rating: 0,
    reviewsCount: 0,
    itemsSold: 0,
    createdAt: Timestamp.now(),
  };

  if (zipCode) {
    newUser.zipCode = zipCode;
  }

  try {
    const cleanUser = Object.fromEntries(
      Object.entries(newUser).filter(([_, v]) => v !== undefined)
    );
    await setDoc(doc(db, "users", uid), cleanUser);
  } catch (error) {
    console.error("Error creating user entry in Firestore: ", error);
    throw error;
  }
};

export const updateUser = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  const userRef = doc(db, "users", uid);
  try {
    if (data.email) {
      const user = auth.currentUser;
      if (user && user.email !== data.email) {
        await updateEmail(user, data.email);
      }
    }
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Error updating user: ", error);
    throw error;
  }
};

export const updateUserProfile = async (
  uid: string,
  data: Partial<User>
): Promise<void> => {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, data);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
  }
};

export const incrementItemsSold = async (userId: string): Promise<void> => {
  const userRef = doc(db, "users", userId);
  try {
    await updateDoc(userRef, {
      itemsSold: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing itemsSold: ", error);
    throw error;
  }
};
