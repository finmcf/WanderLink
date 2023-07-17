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
import { db } from "./firebaseConfig";
import { AppContext } from "./AppContext";

export const ChatMenuScreen = () => {
  const { user, conversations } = useContext(AppContext);
  const [users, setUsers] = useState({});
  const navigation = useNavigation();

  const fetchUser = async (userId) => {
    const userRef = doc(db, `Users`, userId);
    try {
      const userDoc = await getDoc(userRef);
      return userDoc.data();
    } catch (error) {
      console.log("Error fetching user:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      let newUsers = {};
      for (const convId of conversations) {
        const otherUserId = convId.split("_").find((id) => id !== user.uid);
        const userData = await fetchUser(otherUserId);
        newUsers[otherUserId] = userData;
      }
      setUsers(newUsers);
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
              <Text style={styles.userName}>{otherUser?.name}</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.lastMessage}
              >
                {otherUser?.lastMessage}
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
  userName: {
    fontSize: 16,
    marginRight: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 18,
  },
});
