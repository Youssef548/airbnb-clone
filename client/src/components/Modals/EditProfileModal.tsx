import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Heading from "../Heading";
import Input from "../Inputs/Input";
import useEditProfileModal from "../../hooks/useEditProfileModal";
import useUserStore from "../../store/useStore";

const EditProfileModal = () => {
  const editProfileModal = useEditProfileModal();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      image: user?.image || "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        {
          username: data.username,
          email: data.email,
          image: data.image || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update user in store
      setUser({ ...user, ...response.data });
      toast.success("Profile updated successfully!");
      editProfileModal.onClose();
      reset();

      // Reload page to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Edit Profile" subtitle="Update your profile information" />
      <Input
        id="username"
        label="Username"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="email"
        label="Email"
        type="email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="image"
        label="Avatar URL"
        disabled={isLoading}
        register={register}
        errors={errors}
      />
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={editProfileModal.isOpen}
      title="Edit Profile"
      actionLabel="Save Changes"
      onClose={editProfileModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default EditProfileModal;
