import { create } from "zustand";

interface EditProfileModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useEditProfileModal = create<EditProfileModalProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useEditProfileModal;
