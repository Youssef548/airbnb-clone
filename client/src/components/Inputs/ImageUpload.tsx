import { useCallback, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

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
  const cloundinaryRef = useRef<any>();
  const widgetRef = useRef<any>();

  const handleUpload = useCallback(
    (result: any) => {
      if (result.event === "success") {
        onChange(result.info.secure_url);
      }
    },
    [onChange]
  );

  useEffect(() => {
    cloundinaryRef.current = window.cloudinary;
    widgetRef.current = cloundinaryRef.current.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_APP_CLODINARY_CLOUD_NAME as string,
        uploadPreset: "ml_default",
        maxFiles: 1,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          handleUpload(result);
        }
      }
    );
  }, [handleUpload]);

  return (
    <div
      className="relative cursor-pointer hover:opacity-70 transition border-2 border-dashed p-20 border-neutral-300 flex flex-col justify-center items-center gap-4 text-neutral-600"
      onClick={() => widgetRef.current && widgetRef.current.open()}
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
