import Header from "../../components/layouts/Header";
import Footer from "../../components/layouts/Footer";
import Sidebar from "../../components/layouts/Sidebar";
import Navbar from "../../components/layouts/Navbar/Navbar";
import RegisterModal from "../../components/Modals/RegisterModal";
import LoginModal from "../../components/Modals/LoginModal";
import useUserStore from "../../store/useStore";
import axios from "axios";
axios.defaults.withCredentials = true;

const Home = () => {
  const user = useUserStore((state) => state.user);

  return (
    <div>
      <LoginModal />
      <RegisterModal />

      <Navbar user={user} />
      <Header />
      <Sidebar />
      <div>Main Content Goes Here</div>
      <Footer />

      {user && <div>Welcome, {user.username}!</div>}
    </div>
  );
};

export default Home;
