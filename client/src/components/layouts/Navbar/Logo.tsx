import React from "react";
import Image from "../../../utils/Image";
import svg from "../../../assets/logo.png";
const Logo = () => {
  return (
    <div>
      <Image
        src={svg}
        className="hidden md:block cursor-pointer"
        width="100"
        alt="Logo"
      />
    </div>
  );
};

export default Logo;
