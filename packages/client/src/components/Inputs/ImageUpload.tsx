import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    cloudinary: any;
  }
}

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const cloudinaryRef = useRef<any>();
  const widgetRef = useRef<any>();
  const [isReady, setIsReady] = useState(false);

  const handleUpload = useCallback(
    (result: any) => {
      if (result.event === "success") {
        onChange(result.info.secure_url);
      }
    },
    [onChange]
  );

  useEffect(() => {
    const cloudName = import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME as string;

    if (!cloudName || cloudName === "test") {
      console.warn(
        "Cloudinary cloud name is not configured. Set VITE_APP_CLOUDINARY_CLOUD_NAME in your .env file."
      );
      return;
    }

    if (!window.cloudinary) {
      console.warn("Cloudinary widget script not loaded.");
      return;
    }

    try {
      cloudinaryRef.current = window.cloudinary;
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName,
          uploadPreset: "ml_default",
          maxFiles: 1,
        },
        (error: any, result: any) => {
          if (error) {
            toast.error("Image upload failed. Please try again.");
            return;
          }
          if (result && result.event === "success") {
            handleUpload(result);
          }
        }
      );
      setIsReady(true);
    } catch {
      toast.error("Failed to initialize image uploader.");
    }
  }, [handleUpload]);

  const handleClick = () => {
    const cloudName = import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME as string;

    if (!cloudName || cloudName === "test") {
      toast.error(
        "Image upload is not configured. Please set up Cloudinary."
      );
      return;
    }

    if (!isReady || !widgetRef.current) {
      toast.error("Image uploader is not ready. Please try again.");
      return;
    }

    widgetRef.current.open();
  };

  return (
    <div
      className="relative cursor-pointer hover:opacity-70 transition border-2 border-dashed p-20 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600"
      onClick={handleClick}
    >
      <Icon icon="bx:image-add" fontSize={50} />
      <div className="font-semibold text-lg">Click to upload</div>
      {value && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={value}
            alt="Uploaded Image"
            className="object-fit w-full h-full z-99"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
