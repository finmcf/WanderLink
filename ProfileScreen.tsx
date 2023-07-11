import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "./AppContext";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

const windowWidth = Dimensions.get("window").width;
const imageSize = windowWidth / 2;

export const ProfileScreen = ({ navigation }) => {
  const {
    user,
    userData,
    shouldRerenderProfile,
    setShouldRerenderProfile,
    profilePicUrl,
  } = useContext(AppContext);
  const [userImages, setUserImages] = useState([]);

  useEffect(() => {
    if (user) {
      const listRef = ref(storage, `userMedia/${user.uid}`);
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
        })
        .finally(() => {
          if (shouldRerenderProfile) {
            setShouldRerenderProfile(false);
          }
        });
    }
  }, [user, shouldRerenderProfile, profilePicUrl]);

  const renderItem = ({ item }) => (
    <View>
      <Image source={{ uri: item }} style={styles.postImage} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity
          onLongPress={() => navigation.navigate("ProfilePictureCameraScreen")}
        >
          <Image
            style={styles.profilePic}
            source={{
              uri: profilePicUrl
                ? `${profilePicUrl}?${Date.now()}`
                : "https://via.placeholder.com/150",
            }}
          />
        </TouchableOpacity>
        <View style={styles.profileDetails}>
          <Text style={styles.username}>
            {userData ? userData.username : "Username"}
          </Text>
          <TouchableOpacity
            style={styles.friendContainer}
            onPress={() =>
              navigation.navigate("FriendListScreen", { userId: user.uid })
            }
          >
            <Text style={styles.friendCount}>
              {userData ? userData.friendsCount : 0} Friends
            </Text>
          </TouchableOpacity>
          <Text style={styles.bio}>
            {userData ? userData.bio : "This is a bio!"}
          </Text>
        </View>
        <Ionicons
          name="settings-outline"
          size={24}
          color="black"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>
      <FlatList
        data={userImages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
      />
      <Button title="Log out" onPress={() => navigation.navigate("Login")} />
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
