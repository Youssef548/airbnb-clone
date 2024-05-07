// Assuming BASEURL is a string constant
import axios from "axios";
import { BASEURL } from "./baseurl";

// Define the type for the functions
const registerWithGoogle = async (): Promise<void> => {
 try {
    window.location.href = `${BASEURL}/auth/google`;
    const response = await axios.get(`${BASEURL}/auth/google`);
    console.log(response);
 } catch (err) {
    console.error("Error registering with Google:", err);
    throw err;
 }
};

const registerWithGithub = async (): Promise<void> => {
 try {
    window.location.href = `${BASEURL}/auth/github`;
 } catch (error) {
    console.error("Error registering with GitHub:", error);
    throw error;
 }
};

export { registerWithGoogle, registerWithGithub };
