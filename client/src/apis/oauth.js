import axios from "axios";
import { BASEURL } from "./baseurl";

const registerWithGoogle = async () => {
  try {
    window.location.href = `${BASEURL}/auth/google`;
    const response = await axios.get(`${BASEURL}/auth/google`);
    console.log(response);
  } catch (err) {
    console.err("Error registering with Google:", error);
    throw err;
  }
};

const registerWithGithub = async () => {
  try {
    window.location.href = `${BASEURL}/auth/github`;
  } catch (error) {
    console.error("Error registering with GitHub:", error);
    throw error;
  }
};

export { registerWithGoogle, registerWithGithub };
