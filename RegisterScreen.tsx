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

  const strongPasswordCheck = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  // Function to open the country selector
  const openCountrySelector = () => {
    navigation.navigate("CountrySelect");
  };

  const onRegisterPress = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    // Strong password check
    if (!strongPasswordCheck(password)) {
      Alert.alert(
        "Error",
        "Password must have at least 6 characters, at least one uppercase letter, one lowercase letter, one number and one special character."
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "Users", userCredential.user.uid), {
        userInformation: {
          username: username,
          country: country,
          dateOfBirth: dateOfBirth.toISOString(),
          email: email,
          userId: userCredential.user.uid,
          profilePicture: defaultProfilePictureURL,
        },
        friends: {
          // Friends and messaging data will go here
          // You'll likely want to use a more complex structure in a real app
        },
        userMedia: {
          // Here you can store user's media data
          // Again, in a real app, you'll likely need to use arrays or subcollections
        },
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
