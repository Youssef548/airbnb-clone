import Image from "../utils/Image";
import svg from "../assets/placeholder.jpg";

interface ImageProps {
  src?: string; // Optional prop for an image source, default to placeholder.jpg if not provided.
}
const Avatar = ({ src }: ImageProps) => {
  return (
    <Image
      className="rounded-full"
      width="30"
      height="30"
      alt="Avatar"
      src={src || svg}
    />
  );
};

export default Avatar;
