import useUserStore from "../store/useStore";
import useLoginModal from "../hooks/useLoginModal";

export const handleUnauthorized = () => {
  const { clearUser } = useUserStore.getState();
  localStorage.removeItem("token");
  clearUser();

  useLoginModal.getState().onOpen();
  // window.location.href = "/";
};
