import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet } from "react-native";
import Select from "react-select-country-list";
import { useNavigation } from "@react-navigation/native";
import { LocationContext } from "./LocationContext"; // Add this import

const CountrySelectScreen = () => {
  const location = useContext(LocationContext); // use useContext to get location

  const [value, setValue] = useState(null);
  const options = Select().getData();
  const navigation = useNavigation();

  // On initial render, log the location
  useEffect(() => {
    if (location) {
      console.log(location);
    }
  }, [location]);

  const onChange = (value) => {
    setValue(value);
    navigation.goBack(); // Go back to RegisterScreen after country selection
  };

  return (
    <View style={styles.container}>
      <Select options={options} value={value} onChange={onChange} />
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
