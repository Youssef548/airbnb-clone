import Header from "../../components/layouts/Header";
import Footer from "../../components/layouts/Footer";
import Sidebar from "../../components/layouts/Sidebar";

const Home = () => {
  return (
    <div>
      <Header />
      <Sidebar />
      <div>Main Content Goes Here</div>
      <Footer />
    </div>
  );
};

export default Home;
