import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { AppContext } from "./AppContext";
import { db, storage } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { useNavigation, useRoute } from "@react-navigation/native";

const FriendListScreen = () => {
  const { user, friendList } = useContext(AppContext);
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  const fetchFriends = async () => {
    let userFriends = [];

    if (user) {
      if (userId === user.uid) {
        userFriends = friendList;
      } else {
        const docRef = doc(db, "Users", userId);
        const docSnapshot = await getDoc(docRef);
        userFriends = docSnapshot.data()?.friends || [];
      }

      const friendsData = await Promise.all(
        userFriends.map(async (friendId) => {
          const docRef = doc(db, "Users", friendId);
          const docSnapshot = await getDoc(docRef);
          const data = docSnapshot.data();
          const profilePicUrl = await fetchProfilePicture(friendId);
          return {
            _id: friendId,
            name: data.userInformation.username,
            profilePictureUrl:
              profilePicUrl || data.userInformation.profilePicture,
          };
        })
      );
      setFriends(friendsData);
    }
  };

  const fetchProfilePicture = async (userId) => {
    const profilePicRef = ref(storage, `profilePictures/${userId}.jpg`);
    try {
      const url = await getDownloadURL(profilePicRef);
      return url;
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [userId, friendList]);

  const handleFriendPress = (friendId) => {
    // If selected user is the logged-in user, navigate to the ProfileScreen
    if (user && friendId === user.uid) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("OtherUserProfile", { userId: friendId });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleFriendPress(item._id)}>
            <View style={styles.friendContainer}>
              <Image
                source={{
                  uri:
                    item.profilePictureUrl ||
                    "https://example.com/placeholder-image.jpg",
                }}
                style={styles.profilePic}
              />
              <Text style={styles.username}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  friendContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "gray",
  },
  username: {
    fontSize: 16,
  },
});

export default FriendListScreen;
