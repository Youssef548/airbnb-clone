import { useState } from "react";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import Modal from "./Modal.js";
import Heading from "../Heading.js";
import Input from "../Inputs/Input.js";
import toast from "react-hot-toast";
import Button from "../Buttons.js";
import useLoginModal from "../../hooks/useLoginModal.js";
import { BASEURL } from "../../apis/baseurl.js";

const LoginModal = () => {
  const loginModal = useLoginModal();

  const [isLoading, setIsLoading] = useState(false);

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
          Already have an account?
          <span
            onClick={loginModal.onClose}
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

    axios
      .post(`${BASEURL}/auth/login`, data)
      .then(() => {
        toast.success("Login succufully");
        loginModal.onClose();
      })
      .catch((err) => {
        console.log(err);
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
