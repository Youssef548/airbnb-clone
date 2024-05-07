// UserProvider.js

import React, { useEffect ,  ReactElement } from "react";
import useUserStore, {UserStore} from "../store/useStore"; // Import the user store
import axios from "axios";
import { BASEURL } from "../apis/baseurl";

interface UserProviderProps {
  children: React.ReactNode;
}
const UserProvider:React.FC<UserProviderProps> = ({ children }): ReactElement | null => {
  const setUser: UserStore["setUser"] = useUserStore((state) => state.setUser);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BASEURL}/auth/get-user`); // Replace with your actual API endpoint
        setUser(response.data); // Update the user data in the store
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [setUser]);
  if (!children) {
    return null;
 }




 // If children is already a ReactElement, return it as is
 return children as ReactElement;
};

export default UserProvider;
