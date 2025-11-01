import { create } from "zustand";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useChangePasswordModal = create<ChangePasswordModalProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useChangePasswordModal;
