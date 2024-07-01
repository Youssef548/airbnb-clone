import { Icon } from "@iconify/react";
import { UserType } from "../types/user";

interface HeartButtonProps {
  listingId: string;
  currentUser?: UserType | null;
}

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  currentUser,
}) => {
  const hasFavorite = false;
  const toggleFavorite = () => {};
  return (
    <div
      onClick={toggleFavorite}
      className="
    relative
    hover:opacity-80
    transition
    cursor-pointer"
    >
      <Icon
        icon={"ant-design:heart-outlined"}
        className="
      text-white
      absolute
      -top-[2px]
      -right-[2px]
      "
        fontSize={28}
      />
      <Icon
        className={hasFavorite ? "text-rose-500" : "text-neutral-500/70"}
        icon={"ant-design:heart-filled"}
        fontSize={25}
      />
    </div>
  );
};

export default HeartButton;
