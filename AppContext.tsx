import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

interface ContextProps {
  location: Location.LocationObject | null;
  user: firebase.User | null;
  userData: any;
}

export const AppContext = createContext<Partial<ContextProps>>({});

export const AppProvider = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [user, setUser] = useState<firebase.User | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, "Users", user.uid); // reference to the document
        const userDoc = await getDoc(docRef); // get the document
        if (userDoc.exists()) {
          setUserData(userDoc.data().userInformation); // access userInformation field
        } else {
          console.log("No such document!");
        }
      } else {
        setUserData(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  return (
    <AppContext.Provider value={{ location, user, userData }}>
      {children}
    </AppContext.Provider>
  );
};
