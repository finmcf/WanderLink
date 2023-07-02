import React, { useState } from "react";
import {
  Button,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, storage, db } from "./firebaseConfig";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { ref, deleteObject, listAll } from "firebase/storage";
import { doc, deleteDoc } from "firebase/firestore";

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleDeleteProfile = async () => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);

      // Continue with the deletion process
      const userId = user.uid;

      // 1. Delete user media from Firebase Storage
      const listRef = ref(storage, `userMedia/${userId}`);
      const res = await listAll(listRef);
      res.items.forEach((itemRef) => {
        deleteObject(itemRef);
      });

      // 2. Delete profile picture from Firebase Storage
      const profilePictureRef = ref(storage, `profilePictures/${userId}.jpg`);
      await deleteObject(profilePictureRef);

      // 3. Delete user data from Firestore
      const userDocRef = doc(db, "Users", userId);
      await deleteDoc(userDocRef);

      // 4. Delete user authentication account
      await deleteUser(auth.currentUser);

      // 5. Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error re-authenticating or deleting account", error);
      Alert.alert(
        "Error",
        "Could not delete account. Please check your password."
      );
    }

    // Close the modal after process
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Logout" onPress={handleSignOut} />
      <Button
        title="Delete Profile"
        color="red"
        onPress={() => setModalVisible(true)}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>Enter your password to confirm:</Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              style={styles.textInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={{ ...styles.button, backgroundColor: "red" }}
                onPress={handleDeleteProfile}
              >
                <Text style={styles.textStyle}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    width: 200,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 5,
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SettingsScreen;
