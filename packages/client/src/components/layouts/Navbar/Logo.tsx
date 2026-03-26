import Image from "../../../utils/Image";
import svg from "../../../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Image
        onClick={() => {
          navigate("/");
        }}
        src={svg}
        className="hidden md:block cursor-pointer"
        width="100"
        alt="Logo"
      />
    </div>
  );
};

export default Logo;
