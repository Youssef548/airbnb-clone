import React from "react";

import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" action="">
          <input
            type="email"
            placeholder="your@email.com"
            className="rounded border-gray-300"
          />
          <input
            type="password"
            placeholder="password"
            className="rounded border-gray-300"
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
    </div>
  );
};

export default Login;
