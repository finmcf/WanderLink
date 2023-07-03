import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc } from "firebase/firestore";
import { storage, db } from "./firebaseConfig";

const windowWidth = Dimensions.get("window").width;
const imageSize = windowWidth / 2;

export const OtherUserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [userImages, setUserImages] = useState([]);
  const [profilePicUrl, setProfilePicUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user data
      const userDocRef = doc(db, "Users", userId);
      const userDoc = await getDoc(userDocRef);
      setUserData(userDoc.data());

      // Fetch profile picture
      const profilePicRef = ref(storage, `profilePictures/${userId}.jpg`);
      try {
        const url = await getDownloadURL(profilePicRef);
        setProfilePicUrl(url);
      } catch (error) {
        console.log("Error fetching profile picture:", error);
      }

      // Fetch user media
      const listRef = ref(storage, `userMedia/${userId}`);
      listAll(listRef)
        .then((res) => {
          const promises = res.items.map((itemRef) => getDownloadURL(itemRef));
          return Promise.all(promises);
        })
        .then((newUrls) => {
          setUserImages(newUrls);
        })
        .catch((error) => {
          console.log(error);
        });
    };
    fetchData();
  }, [userId]);

  const renderItem = ({ item }) => (
    <View>
      <Image source={{ uri: item }} style={styles.postImage} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          style={styles.profilePic}
          source={{
            uri: profilePicUrl || "https://via.placeholder.com/150",
          }}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.username}>
            {userData ? userData.username : "Username"}
          </Text>
          <View style={styles.friendContainer}>
            <Text style={styles.friendCount}>
              {userData ? userData.friendsCount : 0} Friends{" "}
            </Text>
          </View>
          <Text style={styles.bio}>
            {userData ? userData.bio : "This is a bio!"}
          </Text>
        </View>
      </View>
      <FlatList
        data={userImages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileDetails: {
    alignItems: "center",
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  friendContainer: {
    width: "100%",
  },
  friendCount: {
    marginVertical: 5,
  },
  bio: {
    fontSize: 16,
  },
  postImage: {
    width: imageSize,
    height: imageSize,
  },
});
