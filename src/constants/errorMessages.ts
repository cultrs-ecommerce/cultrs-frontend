export const firebaseErrorMessages: { [key: string]: string } = {
  'auth/invalid-credential': "Invalid email or password. Please try again.",
  'auth/user-disabled': "Your account has been disabled.",
  'auth/user-not-found': "No account found with this email address.",
  'auth/wrong-password': "Invalid password. Please try again.",
  'auth/email-already-in-use': "The email address is already in use by another account.",
  'auth/invalid-email': "The email address is not valid.",
  'auth/operation-not-allowed': "Email/password accounts are not enabled. Enable email/password in the Firebase console.",
  'auth/weak-password': "The password is too weak.",
  'default': "An unexpected error occurred. Please try again later."
};