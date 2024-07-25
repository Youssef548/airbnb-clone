import useUserStore from "../store/useStore";

export const handleUnauthorized = () => {
  const { clearUser } = useUserStore.getState();
  clearUser();

  localStorage.removeItem("token");

  window.location.href = "/";
};
