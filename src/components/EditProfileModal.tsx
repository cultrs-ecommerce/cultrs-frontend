import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { updateUser } from "@/controllers/userController";
import { User } from "@/types/User";
import ImageUpload from "@/components/ImageUpload";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const EditProfileModal = ({
  isOpen,
  onClose,
  onUpdate,
}: EditProfileModalProps) => {
  const { user, currentUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [zipCode, setZipCode] = useState(user?.zipCode?.toString() || "");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setZipCode(user.zipCode?.toString() || "");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!currentUser || !user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    if (!/^\d{5}$/.test(zipCode)) {
      toast.error("Please enter a valid 5-digit zip code.");
      return;
    }

    setLoading(true);

    try {
      let profilePictureUrl = user.profilePictureUrl;
      if (profilePictureFile) {
        profilePictureUrl = await toBase64(profilePictureFile);
      }

      await updateUser(currentUser.uid, {
        name,
        email,
        zipCode: Number(zipCode),
        profilePictureUrl,
      });

      const updatedUser = {
        ...user,
        name,
        email,
        zipCode: Number(zipCode),
        profilePictureUrl,
      };
      onUpdate(updatedUser as User);

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <ImageUpload
            onFileChange={setProfilePictureFile}
            initialImageUrl={user?.profilePictureUrl}
          />
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
