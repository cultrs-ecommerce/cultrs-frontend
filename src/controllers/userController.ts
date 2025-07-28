import { db } from "../firebaseConfig";
import { doc, setDoc, Timestamp, updateDoc, increment } from "firebase/firestore";
import { User } from "@/types/User";

export const createUser = async (
  uid: string,
  email: string,
  name: string,
  location?: string
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

  // Only add location if it's provided
  if (location) {
    newUser.location = location;
  }

  try {
    // Firestore doesn't allow undefined values.
    // We need to ensure that no fields are undefined.
    const cleanUser = Object.fromEntries(
      Object.entries(newUser).filter(([_, v]) => v !== undefined)
    );

    await setDoc(doc(db, "users", uid), cleanUser);
  } catch (error) {
    console.error("Error creating user entry in Firestore: ", error);
    throw error;
  }
};

export const incrementItemsSold = async (userId: string): Promise<void> => {
    const userRef = doc(db, "users", userId);
    try {
        await updateDoc(userRef, {
            itemsSold: increment(1)
        });
    } catch (error) {
        console.error("Error incrementing itemsSold: ", error);
        throw error;
    }
};
