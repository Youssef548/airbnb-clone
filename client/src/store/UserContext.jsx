import React, { useEffect, useState } from "react";

import { createContext } from "react";
import axios from "axios";
import { GetProfile } from "../utils/Routes";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    const fecthProfile = async () => {
      if (!user) {
        try {
          const { data } = await axios.get(GetProfile, {
            withCredentials: true,
          });
          setUser(data.user);
          setIsLoading(false);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fecthProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </UserContext.Provider>
  );
}
