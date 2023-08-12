import { IndexPage, LoginPage, RegisterPage, AccountPage } from "./pages";
import { Layout, Header, Login } from "./components";
import { Routes, Route } from "react-router-dom";
import { UserContextProvider } from "./store/UserContext";
// import PlacesPage from "./pages/PlacesPage";
import { PlacesPage, PlacesFormPage } from "./pages";

function App() {
  return (
    <>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/places" element={<PlacesPage />} />
            <Route path="/account/places/new" element={<PlacesFormPage />} />
          </Route>
        </Routes>
      </UserContextProvider>
    </>
  );
}

export default App;
