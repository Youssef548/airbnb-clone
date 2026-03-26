import Container from "../../Container";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";
import { UserType } from "@airbnb/shared";
import Categories from "./Categories"
interface NavBarProps {
  user?: UserType | null | undefined;
}

const Navbar: React.FC<NavBarProps> = ({ user }) => {
  return (
    <div className=" w-full bg-white z-10 shadow-sm">
      <div className="py-4 border-b-[1px]">
        <Container>
          <div
            className="
          flex
          flex-row
          items-center
          justify-between
          gap-3
          md:gap-0
          "
          >
            <Logo />
            <Search />
            <UserMenu user={user} />
          </div>
        </Container>
      </div>

      <Categories />
    </div>
  );
};

export default Navbar;
