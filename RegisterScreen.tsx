import React, { useState } from "react";
import {
  Button,
  View,
  StyleSheet,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import DateTimePicker from "@react-native-community/datetimepicker";

// Default profile picture URL
const defaultProfilePictureURL = "https://via.placeholder.com/150";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Function to open the country selector
  const openCountrySelector = () => {
    navigation.navigate("CountrySelect");
  };

  const onRegisterPress = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }
    // Add a strong password check logic here if needed
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "Users", userCredential.user.uid), {
        username: username,
        country: country,
        dateOfBirth: dateOfBirth.toISOString(),
        email: email,
        userId: userCredential.user.uid,
        friends: [],
        profilePicture: defaultProfilePictureURL,
      });
      navigation.navigate("Main", { screen: "Profile" });
    } catch (error) {
      alert(error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate || Platform.OS !== "ios") {
      setDateOfBirth(selectedDate || dateOfBirth);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
      />
      <Button title="Select Country" onPress={openCountrySelector} />
      <Button
        title="Select Date of Birth"
        onPress={() => setShowDatePicker(true)}
      />
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Button title="Register" onPress={onRegisterPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
});

export default RegisterScreen;
