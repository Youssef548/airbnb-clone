import Header from "../../components/layouts/Header";
import Footer from "../../components/layouts/Footer";
import Sidebar from "../../components/layouts/Sidebar";
import Navbar from "../../components/layouts/Navbar/Navbar";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Header />
      <Sidebar />
      <div>Main Content Goes Here</div>
      <Footer />
    </div>
  );
};

export default Home;
