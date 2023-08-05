import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

import { RegisterRoute } from "../../utils/Routes";

import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toastOptions = { position: toast.POSITION.BOTTOM_RIGHT };

  const validationForm = (data) => {
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

  const registerHandler = async (e) => {
    // validateion
    e.preventDefault();

    const validationErrors = validationForm({ name, email, password });

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((errorMsg) => {
        toast.error(errorMsg, toastOptions);
      });
    } else {
      try {
        await axios.post(RegisterRoute, { name, email, password });
        setName("");
        setEmail("");
        setPassword("");
      } catch (err) {
        toast.error(err.response.data.error, toastOptions);
      }
    }
  };

  return (
    <>
      <div className="mt-4 grow flex items-center justify-around">
        <div className="mb-64">
          <h1 className="text-4xl text-center mb-4">Register</h1>
          <form
            className="max-w-md mx-auto"
            action=""
            onSubmit={registerHandler}
          >
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
            <button className="primary">Register</button>
            <div className="text-center py-2  text-gray-500">
              Already have an account?{" "}
              <Link
                to={"/login"}
                className="underline text-black cursor-pointer"
              >
                Login here
              </Link>
            </div>
          </form>
        </div>
      </div>{" "}
      <ToastContainer />
    </>
  );
};

export default Register;
