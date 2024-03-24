import Header from "../../components/layouts/Header";
import Footer from "../../components/layouts/Footer";
import Sidebar from "../../components/layouts/Sidebar";
import Navbar from "../../components/layouts/Navbar/Navbar";
import Modal from "../../components/Modals/Modal";

const Home = () => {
  return (
    <div>
      <Modal
        isOpen={true}
        onClose={() => {}}
        onSubmit={() => {}}
        actionLabel="dasdas"
      />
      <Navbar />
      <Header />
      <Sidebar />
      <div>Main Content Goes Here</div>
      <Footer />
    </div>
  );
};

export default Home;
