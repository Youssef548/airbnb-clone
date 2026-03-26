import useUserStore from "../store/useStore";
import useLoginModal from "../hooks/useLoginModal";

export const handleUnauthorized = () => {
  const { clearUser } = useUserStore.getState();
  clearUser();
  useLoginModal.getState().onOpen();
};
