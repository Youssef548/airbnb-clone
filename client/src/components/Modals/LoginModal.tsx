import { useCallback, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import Modal from "./Modal.js";
import Heading from "../Heading.js";
import Input from "../Inputs/Input.js";
import toast from "react-hot-toast";
import Button from "../Buttons.js";
import useLoginModal from "../../hooks/useLoginModal.js";

import { setAuthToken } from "../../utils/authUtils";
import { loginRequest } from "../../apis/login.js";

import useUserStore from "../../store/useStore";
import useRegisterModal from "../../hooks/useRegisterModal.js";

const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const userStore = useUserStore(); // Access the store


  const [isLoading, setIsLoading] = useState(false);
  const setUser = userStore.setUser;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const toggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  
  }, [loginModal, registerModal])

  const bodyContent = (
    <div>
      <Heading title="Welcome to Airbnb" subTitle="Login to your account!" />
      <Input
        id="email"
        label="Email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        validation={{
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Invalid email address"
          }
        }}
      />
      <Input
        id="password"
        label="Password"
        disabled={isLoading}
        register={register}
        errors={errors}
        type="password"
        required
        validation={{
          required: "Password is required",
          minLength: {
            value: 5,
            message: "Password must be at least 5 characters"
          }
        }}
      />
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <Button
        outline
        label="Continue with Google"
        icon="logos:google"
        iconSize="24px"
        onClick={() => {}}
      />
      <Button
        outline
        label="Continue with Github"
        icon="mdi:github"
        iconSize="24px"
        onClick={() => {}}
      />

      <div
        className="
          text-neutral-500 
          text-center 
          mt-4 
          font-light
        "
      >
        <p>
          First time using Airbnb?
          <span
            onClick={toggle}
            className="
              text-neutral-800
              cursor-pointer
              hover:underline
            "
          >
            {" "}Create an account
          </span>
        </p>
      </div>
    </div>
  );

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    loginRequest(data)
      .then((res) => {
        toast.success("Logged in successfully");
        loginModal.onClose();
        setAuthToken(res.data.token);
        setUser(res.data.currentUser);
      })
      .catch((err) => {
        // Safe error handling with type guards
        if (err.response) {
          // Server responded with an error
          const errorMessage = err.response.data?.message || err.response.data?.error;

          if (errorMessage && err.response.status !== 500) {
            toast.error(errorMessage);
          } else if (err.response.status === 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error("An error occurred. Please try again.");
          }
        } else if (err.request) {
          // Request was made but no response received (network error)
          toast.error("Network error. Please check your connection.");
        } else {
          // Something else happened
          toast.error("An unexpected error occurred.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return (
    <Modal
      disabled={isLoading}
      title="Login"
      actionLabel="Continue"
      onSubmit={handleSubmit(onSubmit)}
      isOpen={loginModal.isOpen}
      onClose={loginModal.onClose}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default LoginModal;
