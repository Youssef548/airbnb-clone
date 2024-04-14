import Header from "../../components/layouts/Header";
import Footer from "../../components/layouts/Footer";
import Sidebar from "../../components/layouts/Sidebar";
import Navbar from "../../components/layouts/Navbar/Navbar";
import Modal from "../../components/Modals/Modal";
import RegisterModal from "../../components/Modals/RegisterModal";
import LoginModal from "../../components/Modals/LoginModal";
import axios from "axios";
axios.defaults.withCredentials = true;

const Home = () => {
  return (
    <div>
      <LoginModal /> 
      <RegisterModal />

      <Navbar />
      <Header />
      <Sidebar />
      <div>Main Content Goes Here</div>
      <Footer />
    </div>
  );
};

export default Home;
