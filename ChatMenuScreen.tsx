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
import { ref, getDownloadURL } from "firebase/storage";
import { AppContext } from "./AppContext";

export const ChatMenuScreen = () => {
  const { user, conversations } = useContext(AppContext);
  const [profilePictures, setProfilePictures] = useState({});
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
    const fetchProfilePictures = async () => {
      let newProfilePictures = {};
      for (const conv of conversations) {
        const otherUserId = conv.participants.find((id) => id !== user.uid);
        const profilePicUrl = await fetchProfilePicture(otherUserId);
        newProfilePictures[otherUserId] = profilePicUrl;
      }
      setProfilePictures(newProfilePictures);
    };
    fetchProfilePictures();
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
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const otherUserId = item.participants.find((id) => id !== user.uid);
          return (
            <TouchableOpacity
              style={styles.userContainer}
              onPress={() => handlePress(otherUserId)}
            >
              <Image
                source={{ uri: profilePictures[otherUserId] }}
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
  lastMessage: {
    flex: 1,
    fontSize: 18,
  },
});
