import React, { useState, useContext } from "react";
import {
  Button,
  View,
  StyleSheet,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { auth, db } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import CountryPicker from "react-native-country-picker-modal";
import { AppContext } from "./AppContext";

const defaultProfilePictureURL = "https://via.placeholder.com/150";

const RegisterScreen = ({ navigation }) => {
  const { countryCode: defaultCountryCode } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const strongPasswordCheck = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const onRegisterPress = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

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
          lowercaseUsername: username.toLowerCase(),
          country: countryCode,
          dateOfBirth: dateOfBirth.toISOString(),
          email: email,
          userId: userCredential.user.uid,
          profilePicture: defaultProfilePictureURL,
        },
        friendRequestsReceived: {}, // Object to store friend requests received
        friendRequestsSent: {}, // Object to store friend requests sent
        friends: {}, // Object to store the user's friends
        notifications: [], // Array to store notifications
        conversations: [], // Array to store conversations
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
      <CountryPicker
        withFilter
        withFlag
        countryCode={countryCode}
        withCountryNameButton
        withCallingCode
        withAlphaFilter
        withEmoji
        onSelect={(country) => setCountryCode(country.cca2)}
      />
      <Button title="Register" onPress={onRegisterPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default RegisterScreen;
