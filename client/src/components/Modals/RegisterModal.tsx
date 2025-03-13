import { useCallback, useState } from "react";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import useRegisterModal from "../../hooks/useRegisterModal";

import { BASEURL } from "../../apis/baseurl";
import { registerWithGoogle, registerWithGithub } from "../../apis/oauth";

import Modal from "./Modal";
import Heading from "../Heading";
import Input from "../Inputs/Input";
import toast from "react-hot-toast";
import Button from "../Buttons";
import useLoginModal from "../../hooks/useLoginModal";
import { axiosInstance } from "../../providers/AxiosInstance";
import { registerRequest } from "../../apis/auth/auth";
import { RequestBodyType } from "../../apis/auth/auth.types";

const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleRegister = async () => {
    try {
      const response = await registerWithGoogle();
      console.log(response); // Handle the response as needed
    } catch (error) {
      console.error('Error registering with Google:', error);
    }
  }
  const handleGithubRegister = async () => {
    try {
      const response = await registerWithGithub();
      console.log(response); // Handle the response as needed
    } catch (error) {
      console.error('Error registering with Google:', error);
    }
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
      />
      <Input
        id="username"
        label="Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        label="Password"
        disabled={isLoading}
        register={register}
        errors={errors}
        type="password"
        required
      />
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <Button
        outline
        label="Continue with Google"
        icon="logos:facebook"
        iconSize="24px"
        onClick={handleGoogleRegister}
      />
      <Button
        outline
        label="Continue with Github"
        icon="mdi:github"
        iconSize="24px"
        onClick={handleGithubRegister}
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

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    const requestData: RequestBodyType = {
      username: data.username,
      email: data.email,
      password: data.password,
    };

    registerRequest(requestData)
      .then(() => {
        registerModal.onClose();
      })
      .catch((err) => {
        if (err.response.data.message && err.response.status !== 500) {
          toast.error(err.response.data.message);
        } else {
          toast.error(`something went wrong`);
        }

      })
      .finally(() => {
        setIsLoading(false);
      });
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
