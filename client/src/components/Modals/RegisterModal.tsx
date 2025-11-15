import { useCallback, useState, useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import useRegisterModal from "../../hooks/useRegisterModal";

import { registerWithGoogle, registerWithGithub, checkOAuthAvailability } from "../../apis/oauth";

import Modal from "./Modal";
import Heading from "../Heading";
import Input from "../Inputs/Input";
import toast from "react-hot-toast";
import Button from "../Buttons";
import useLoginModal from "../../hooks/useLoginModal";
import { registerRequest } from "../../apis/auth/auth";
import { RequestBodyType } from "../../apis/auth/auth.types";
import { loginRequest } from "../../apis/login";
import { setAuthToken } from "../../utils/authUtils";
import useUserStore from "../../store/useStore";

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const userStore = useUserStore();
  const setUser = userStore.setUser;

  const [isLoading, setIsLoading] = useState(false);
  const [oauthAvailable, setOauthAvailable] = useState({ google: false, github: false });

  // Check OAuth availability on component mount
  useEffect(() => {
    const checkAvailability = async () => {
      const availability = await checkOAuthAvailability();
      setOauthAvailable(availability);
    };
    checkAvailability();
  }, []);

  const handleGoogleRegister = () => {
    registerWithGoogle();
  }

  const handleGithubRegister = () => {
    registerWithGithub();
  }


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    }

  });



  const toggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();

  }, [loginModal, registerModal])

  const bodyContent = (
    <div>
      <Heading title="Welcome to Airbnb" subTitle="Create an account!" />
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
        id="username"
        label="Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        validation={{
          required: "Name is required",
          minLength: {
            value: 3,
            message: "Name must be at least 3 characters"
          },
          maxLength: {
            value: 20,
            message: "Name must be less than 20 characters"
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
      {(oauthAvailable.google || oauthAvailable.github) && <hr />}

      {oauthAvailable.google && (
        <Button
          outline
          label="Continue with Google"
          icon="logos:google"
          iconSize="24px"
          onClick={handleGoogleRegister}
        />
      )}

      {oauthAvailable.github && (
        <Button
          outline
          label="Continue with Github"
          icon="mdi:github"
          iconSize="24px"
          onClick={handleGithubRegister}
        />
      )}

      <div
        className="
          text-neutral-500 
          text-center 
          mt-4 
          font-light
        "
      >
        <p>
          Already have an account?
          <span
            onClick={toggle}
            className="
              text-neutral-800
              cursor-pointer 
              hover:underline
            "
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    const requestData: RequestBodyType = {
      username: data.username,
      email: data.email,
      password: data.password,
    };

    try {
      // Register the user
      await registerRequest(requestData);
      toast.success("Registration successful! Logging you in...");

      // Auto-login after successful registration
      const loginData = {
        email: data.email,
        password: data.password,
      };

      const loginResponse = await loginRequest(loginData);

      // Set token and user data
      setAuthToken(loginResponse.data.token);
      setUser(loginResponse.data.currentUser);

      toast.success("Welcome to Airbnb!");
      registerModal.onClose();
    } catch (err: unknown) {
      // Safe error handling with type guards
      const error = err as { response?: { data?: { message?: string; error?: string }; status?: number }; request?: unknown };
      if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data?.message || error.response.data?.error;

        if (errorMessage && error.response.status !== 500) {
          toast.error(errorMessage);
        } else if (error.response.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
      } else if (error.request) {
        // Request was made but no response received (network error)
        toast.error("Network error. Please check your connection.");
      } else {
        // Something else happened
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      disabled={isLoading}
      title="Register"
      actionLabel="Continue"
      onSubmit={handleSubmit(onSubmit)}
      isOpen={registerModal.isOpen}
      onClose={registerModal.onClose}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;
