import { IndexPage, LoginPage, RegisterPage, AccountPage } from "./pages";
import { Layout, Header, Login } from "./components";
import { Routes, Route } from "react-router-dom";
import { UserContextProvider } from "./store/UserContext";

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
          </Route>
        </Routes>
      </UserContextProvider>
    </>
  );
}

export default App;
