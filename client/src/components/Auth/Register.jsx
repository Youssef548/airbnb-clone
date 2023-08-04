import React from "react";

import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Register</h1>
        <form className="max-w-md mx-auto" action="">
          <input
            type="text"
            placeholder="Your Name"
            className="rounded border-gray-300"
          />
          <input
            type="email"
            placeholder="your@email.com"
            className="rounded border-gray-300"
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded border-gray-300"
          />
          <button className="primary">Register</button>
          <div className="text-center py-2  text-gray-500">
            Already have an account?{" "}
            <Link to={"/login"} className="underline text-black cursor-pointer">
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
