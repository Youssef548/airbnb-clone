import React, { useState, useContext } from "react";
import Modal from "./Modal";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { UserContext } from "../../store/UserContext";

import { LoginRoute } from "../../utils/Routes";
import RegisterModal from "./RegisterModal";

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(UserContext);

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const toastOptions = { position: toast.POSITION.BOTTOM_RIGHT };

  const validationLoginForm = (data) => {
    const errors = {};

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Invalid email format";
    }

    if (!data.password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  };

  const loginHandler = async () => {
    const validationErrors = validationLoginForm({ email, password });

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((errorMsg) => {
        toast.error(errorMsg, toastOptions);
      });
    } else {
      try {
        const { data } = await axios.post(
          LoginRoute,
          { email, password },
          { withCredentials: true }
        );
        setUser(data.user);
        setEmail("");
        setPassword("");
      } catch (err) {
        console.log(err.response.data);
        toast.error(err.response.data.message, toastOptions);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"Login"}
      body={
        <>
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
      actionLabel={"Login"}
      onSubmit={loginHandler}
      secondaryAction={onClose}
    />
  );
};

export default LoginModal;
