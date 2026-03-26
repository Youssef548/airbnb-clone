import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { axiosInstance } from "../../providers/AxiosInstance";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Build full URL: VITE_BACKEND_URL is "http://localhost:3000/api/"
      // We need "http://localhost:3000" + "/uploads/filename.jpg"
      const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
      const serverOrigin = backendUrl.replace(/\/api\/?$/, "");
      const fullUrl = `${serverOrigin}${res.data.url}`;
      onChange(fullUrl);
      toast.success("Image uploaded successfully!");
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className="relative cursor-pointer hover:opacity-70 transition border-2 border-dashed p-20 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600"
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      {isUploading ? (
        <>
          <Icon icon="eos-icons:loading" fontSize={50} />
          <div className="font-semibold text-lg">Uploading...</div>
        </>
      ) : (
        <>
          <Icon icon="bx:image-add" fontSize={50} />
          <div className="font-semibold text-lg">Click to upload</div>
        </>
      )}
      {value && !isUploading && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={value}
            alt="Uploaded image"
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
