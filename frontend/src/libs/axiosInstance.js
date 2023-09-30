import axios from "axios";

const makeReq = axios.create({
  withCredentials: true,
});

// Array of login and register page URLs
const loginRegisterPages = ["/login", "/register", "/"];

// Add a response interceptor
makeReq.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response && error.response.status === 401) ||
      (error.response && error.response.status === 403)
    ) {
      const currentUrl = window.location.pathname;

      if (
        !loginRegisterPages.includes(currentUrl) &&
        !currentUrl.startsWith("/place/")
      ) {
        // Redirect or handle unauthorized request here
        window.location.href = "/login"; // Replace with the appropriate login page URL
        // Alternatively, you can use a router navigation method if you are using a client-side router
        // router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default makeReq;
