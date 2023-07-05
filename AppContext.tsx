import React, { createContext, useState, useEffect } from "react";
import * as Location from "expo-location";
import { auth, db, storage } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

// Define the shape of your context
interface ContextProps {
  location: Location.LocationObject | null;
  user: firebase.User | null;
  userData: any;
  countryCode: string | null;
  shouldRerenderProfile: boolean;
  setShouldRerenderProfile: React.Dispatch<React.SetStateAction<boolean>>;
  previousScreen: string | null;
  setPreviousScreen: React.Dispatch<React.SetStateAction<string | null>>;
  profilePicUrl: string | null;
  setProfilePicUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AppContext = createContext<Partial<ContextProps>>({});

export const AppProvider: React.FC = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [user, setUser] = useState<firebase.User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [shouldRerenderProfile, setShouldRerenderProfile] =
    useState<boolean>(false);
  const [previousScreen, setPreviousScreen] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      // Reverse geocode to get country code
      if (location && location.coords) {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (reverseGeocode && reverseGeocode.length > 0) {
          setCountryCode(reverseGeocode[0].isoCountryCode);
        }
      }
    })();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data().userInformation);
        } else {
          console.log("No such document!");
        }

        const imagePath = `profilePictures/${user.uid}.jpg`;

        const profilePicRef = ref(storage, imagePath);
        getDownloadURL(profilePicRef)
          .then((url) => {
            setProfilePicUrl(url);
          })
          .catch((error) => {
            console.log("Error fetching profile picture:", error);
          });
      } else {
        setUserData(null);
        setProfilePicUrl(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  return (
    <AppContext.Provider
      value={{
        location,
        user,
        userData,
        countryCode,
        shouldRerenderProfile,
        setShouldRerenderProfile,
        previousScreen,
        setPreviousScreen,
        profilePicUrl,
        setProfilePicUrl, // Providing setProfilePicUrl through the context
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
