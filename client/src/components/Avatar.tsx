import Image from "../utils/Image";
import svg from "../assets/placeholder.jpg";
const Avatar = () => {
  return (
    <Image
      className="rounded-full"
      width="30"
      height="30"
      alt="Avatar"
      src={svg}
    />
  );
};

export default Avatar;
