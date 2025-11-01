import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Heading from "../Heading";
import Input from "../Inputs/Input";
import useChangePasswordModal from "../../hooks/useChangePasswordModal";

const ChangePasswordModal = () => {
  const changePasswordModal = useChangePasswordModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FieldValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/users/change-password`,
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Password changed successfully!");
      changePasswordModal.onClose();
      reset();
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Change Password"
        subtitle="Update your account password"
      />
      <Input
        id="currentPassword"
        label="Current Password"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="newPassword"
        label="New Password"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <div className="text-xs text-neutral-500 mt-2">
        <p>Password must contain:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>At least 8 characters</li>
          <li>One uppercase letter</li>
          <li>One lowercase letter</li>
          <li>One number</li>
          <li>One special character (!@#$%^&*)</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={changePasswordModal.isOpen}
      title="Change Password"
      actionLabel="Change Password"
      onClose={changePasswordModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default ChangePasswordModal;
