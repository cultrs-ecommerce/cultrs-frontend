import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon } from "lucide-react";

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
  initialImageUrl?: string;
}

const ImageUpload = ({
  onFileChange,
  initialImageUrl = "/placeholder.svg",
}: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onFileChange(null);
    }
  };

  return (
    <div className="space-y-2 text-center">
      <Avatar className="h-24 w-24 mx-auto">
        <AvatarImage src={preview || initialImageUrl} />
        <AvatarFallback>
          <UserIcon className="h-12 w-12" />
        </AvatarFallback>
      </Avatar>
      <Label htmlFor="profilePicture">Profile Picture</Label>
      <Input
        id="profilePicture"
        name="profilePicture"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="w-full"
      />
    </div>
  );
};

export default ImageUpload;
