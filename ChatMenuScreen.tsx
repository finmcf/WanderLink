import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import { AppContext } from "./AppContext";

export const ChatMenuScreen = () => {
  const { user, conversations } = useContext(AppContext);
  const [users, setUsers] = useState({});
  const navigation = useNavigation();

  const fetchUser = async (userId) => {
    const userRef = doc(db, "Users", userId);
    try {
      const userDoc = await getDoc(userRef);
      return userDoc.data();
    } catch (error) {
      console.log("Error fetching user:", error);
      return null;
    }
  };

  const fetchProfilePicture = async (userId) => {
    const profilePicRef = ref(storage, `profilePictures/${userId}.jpg`);
    try {
      const url = await getDownloadURL(profilePicRef);
      return url;
    } catch (error) {
      console.log("Error fetching profile picture:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      let newUsers = { ...users }; // cloning current users state
      for (const convId of conversations) {
        const otherUserId = convId.split("_").find((id) => id !== user.uid);
        const userData = await fetchUser(otherUserId);
        const profilePictureUrl = await fetchProfilePicture(otherUserId);
        newUsers[otherUserId] = {
          ...userData,
          profilePicture: profilePictureUrl,
        };
      }
      setUsers(newUsers); // updating users state
    };
    fetchUsers();
  }, [conversations]);

  const handlePress = (otherUserId) => {
    navigation.navigate("Chat", {
      screen: "ChatScreen",
      params: { userId: otherUserId },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const otherUserId = item.split("_").find((id) => id !== user.uid);
          const otherUser = users[otherUserId];
          return (
            <TouchableOpacity
              style={styles.userContainer}
              onPress={() => handlePress(otherUserId)}
            >
              <Image
                source={{
                  uri:
                    otherUser?.profilePicture ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.profileImage}
              />
              <Text style={styles.userName}>
                {otherUser?.name || "Loading..."}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
  },
});
