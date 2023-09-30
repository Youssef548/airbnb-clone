import React, { useState } from "react";
import Modal from "./Modal";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { RegisterRoute } from "../../utils/Routes";
import useRegisterModal from "../../hooks/useRegisterModal";
import useLoginModal from "../../hooks/useLoginModal";
const RegisterModal = ({ isOpen, onClose }) => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toastOptions = { position: toast.POSITION.BOTTOM_RIGHT };

  const validationRegisterForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "Name is required";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Invalid email format";
    }

    if (!data.password.trim()) {
      errors.password = "Password is required";
    } else if (data.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  };

  const registerHandler = async () => {
    // validateion
    // e.preventDefault();

    const validationErrors = validationRegisterForm({ name, email, password });

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((errorMsg) => {
        toast.error(errorMsg, toastOptions);
      });
    } else {
      try {
        await axios.post(RegisterRoute, { name, email, password });
        registerModal.onClose();
        loginModal.onOpen();
        setName("");
        setEmail("");
        setPassword("");
      } catch (err) {
        console.log(err);
        toast.error(err.response.data.error, toastOptions);
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={registerModal.isOpen}
        onClose={registerModal.onClose}
        title={"Register"}
        body={
          <>
            <input
              type="text"
              placeholder="Your Name"
              className="rounded border-gray-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="your@email.com"
              className="rounded border-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="rounded border-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <ToastContainer />
          </>
        }
        actionLabel={"Register"}
        onSubmit={registerHandler}
      />
    </>
  );
};

export default RegisterModal;
