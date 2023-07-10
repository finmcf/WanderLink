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
import { collection, doc, getDoc, query, where, ref } from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import { useNavigation } from "@react-navigation/native";

const FriendListScreen = () => {
  const { user } = useContext(AppContext);
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();

  const fetchFriends = async () => {
    if (user) {
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("friends", "array-contains", user.uid));
      const querySnapshot = await getDocs(q);
      const friendsData = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const profilePicUrl = await fetchProfilePicture(docSnapshot.id);
          return {
            _id: docSnapshot.id,
            name: data.username,
            profilePictureUrl: profilePicUrl || data.profilePicture,
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
      console.log("Error fetching profile picture:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleFriendPress = (friendId) => {
    navigation.navigate("OtherUserProfile", { userId: friendId });
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
                source={{ uri: item.profilePictureUrl }}
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
  },
  username: {
    fontSize: 16,
  },
});

export default FriendListScreen;
