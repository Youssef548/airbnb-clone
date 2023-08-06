import React, { useEffect, useState } from "react";

import { createContext } from "react";
import axios from "axios";
import { GetProfile } from "../utils/Routes";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fecthProfile = async () => {
      if (!user) {
        try {
          const { data } = await axios.get(GetProfile, {
            withCredentials: true,
          });
          setUser(data.user);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fecthProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
