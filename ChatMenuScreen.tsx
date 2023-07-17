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
import { db, storage } from "./firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { AppContext } from "./AppContext";

export const ChatMenuScreen = () => {
  const { user } = useContext(AppContext);
  const [conversations, setConversations] = useState([]);
  const navigation = useNavigation();

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
    const conversationsRef = collection(db, "Conversations");
    const convQuery = query(
      conversationsRef,
      orderBy("lastMessageTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(convQuery, async (snapshot) => {
      const loadedConversations = await Promise.all(
        snapshot.docs
          .filter((doc) => doc.data().participants.includes(user.uid)) // filter for conversations where the current user is a participant
          .map(async (doc) => {
            const data = doc.data();
            const otherUserId = data.participants.find((id) => id !== user.uid); // get the ID of the other user
            const profilePicUrl = await fetchProfilePicture(otherUserId);
            return {
              _id: doc.id,
              lastMessage: data.lastMessage,
              profilePictureUrl: profilePicUrl,
              otherUserId,
            };
          })
      );
      setConversations(loadedConversations);
    });

    return unsubscribe;
  }, []);

  const handlePress = (otherUserId) => {
    navigation.navigate("Chat", { userId: otherUserId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userContainer}
            onPress={() => handlePress(item.otherUserId)}
          >
            <Image
              source={{ uri: item.profilePictureUrl }}
              style={styles.profileImage}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.lastMessage}
            >
              {item.lastMessage}
            </Text>
          </TouchableOpacity>
        )}
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
  lastMessage: {
    flex: 1,
    fontSize: 18,
  },
});
