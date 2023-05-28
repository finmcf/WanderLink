import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Select from "react-select-country-list";
import { useNavigation } from "@react-navigation/native";

const CountrySelectScreen = ({ route }) => {
  const { location } = route.params;
  const [value, setValue] = useState(null);
  const options = Select().getData();
  const navigation = useNavigation();

  // On initial render, select the default country from location
  useEffect(() => {
    if (location) {
      const defaultCountry = options.find(
        (option) => option.label === location.country
      );
      setValue(defaultCountry);
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
