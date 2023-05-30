import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "./AppContext"; // Use AppContext instead of LocationContext
import CountryPicker from "react-native-country-picker-modal";

const CountrySelectScreen = () => {
  const { location } = useContext(AppContext); // Extract location from AppContext
  const [countryCode, setCountryCode] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (location) {
      console.log(location);
      setCountryCode(location?.country);
    }
  }, [location]);

  const onSelect = (country) => {
    setCountryCode(country.cca2);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <CountryPicker
        countryCode={countryCode}
        withFlag
        withCountryNameButton
        withCallingCodeButton
        withAlphaFilter
        withFilter // Enables the search bar
        withEmoji
        onSelect={onSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
});

export default CountrySelectScreen;
