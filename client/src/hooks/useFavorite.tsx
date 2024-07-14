import { useNavigate } from "react-router-dom";
import { UserType } from "../types/user";
import useLoginModal from "./useLoginModal";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import useUserStore from "../store/useStore";
import { addFavorite, deleteFavorite } from "../apis/Favorites/favorite";

interface IUseFavroite {
  listingId: string;
  currentUser?: UserType | null;
}

const useFavorite = ({ listingId, currentUser }: IUseFavroite) => {
  const userStore = useUserStore(); // Access the store

  const setUser = userStore.setUser;
  const navigate = useNavigate();

  const loginModal = useLoginModal();

  const hasFavorited = useMemo(() => {
    const list = currentUser?.favoriteListingsIds || [];
    console.log(list);
    return list.includes(listingId);
  }, [currentUser, listingId]);

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      if (!currentUser) {
        return loginModal.onOpen();
      }

      try {
        let request;

        if (hasFavorited) {
          request = () => deleteFavorite(listingId);
        } else {
          request = () => addFavorite(listingId);
        }

        const response = await request();
        const updatedUser = response.data.data;
        setUser(updatedUser);
      } catch (err) {
        const error = err as Error;
        toast.error(error.message);
      }
    },
    [currentUser, hasFavorited, listingId, loginModal, navigate]
  );

  return {
    hasFavorited,
    toggleFavorite,
  };
};

export default useFavorite;
