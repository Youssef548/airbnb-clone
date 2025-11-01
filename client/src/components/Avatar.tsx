import Image from "../utils/Image";
import svg from "../assets/placeholder.jpg";

interface ImageProps {
  src?: string; // Optional prop for an image source, default to placeholder.jpg if not provided.
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: { width: "30", height: "30" },
  md: { width: "50", height: "50" },
  lg: { width: "80", height: "80" },
  xl: { width: "120", height: "120" },
};

const Avatar = ({ src, size = "sm" }: ImageProps) => {
  const dimensions = sizeMap[size];

  return (
    <Image
      className="rounded-full"
      width={dimensions.width}
      height={dimensions.height}
      alt="Avatar"
      src={src || svg}
    />
  );
};

export default Avatar;
