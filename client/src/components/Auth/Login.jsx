import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

import { LoginRoute } from "../../utils/Routes";

import { Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toastOptions = { position: toast.POSITION.BOTTOM_RIGHT };

  const validationForm = (data) => {
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

  const loginHandler = async (e) => {
    // validation
    e.preventDefault();

    const validationErrors = validationForm({ email, password });

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((errorMsg) => {
        toast.error(errorMsg, toastOptions);
      });
    } else {
      try {
        await axios.post(LoginRoute, { email, password });
        setEmail("");
        setPassword("");
        // Redirect or perform other actions after successful login
      } catch (err) {
        console.log(err.response.data);
        toast.error(err.response.data.message, toastOptions);
      }
    }
  };

  return (
    <>
      <div className="mt-4 grow flex items-center justify-around">
        <div className="mb-64">
          <h1 className="text-4xl text-center mb-4">Login</h1>
          <form className="max-w-md mx-auto" action="" onSubmit={loginHandler}>
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
            <button className="primary">Login</button>
            <div className="text-center py-2  text-gray-500">
              Don't have an account yet?{" "}
              <Link
                to={"/register"}
                className="underline text-black cursor-pointer"
              >
                Register now
              </Link>
            </div>
          </form>
        </div>
      </div>{" "}
      <ToastContainer />
    </>
  );
};

export default Login;
