import React, { useState, useContext } from "react";
import Modal from "./Modal";
import { toast, ToastContainer } from "react-toastify";
import { UserContext } from "../../store/UserContext";

import { LoginRoute } from "../../utils/Routes";
import useLoginModal from "../../hooks/useLoginModal";
import makeReq from "../../libs/axiosInstance";
import {useNavigate} from "react-router-dom";

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const loginModal = useLoginModal();
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

  const toastOptions = { position: toast.POSITION.TOP };

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
        toast.error(errorMsg, toastOptions, { id: "error1" });
      });
    } else {
      try {
        const { data } = await makeReq.post(LoginRoute, { email, password });
        setUser(data.user);
        setEmail("");
        setPassword("");
        loginModal.onClose();
        
        navigate("/account")
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <Modal
      isOpen={loginModal.isOpen}
      onClose={loginModal.onClose}
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
