import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";
import { auth } from "./firebaseConfig";

interface ContextProps {
  location: Location.LocationObject | null;
  user: firebase.User | null;
}

export const AppContext = createContext<Partial<ContextProps>>({});

export const AppProvider = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [user, setUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider value={{ location, user }}>
      {children}
    </AppContext.Provider>
  );
};
