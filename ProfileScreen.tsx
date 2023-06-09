import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "./AppContext";
import { listAll, ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";

const windowWidth = Dimensions.get("window").width;
const imageSize = windowWidth / 2;

export const ProfileScreen = ({ navigation }) => {
  const { user, userData, shouldRerenderProfile, setShouldRerenderProfile } =
    useContext(AppContext);
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
  }, [user, shouldRerenderProfile]);

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
            uri: userData
              ? userData.profilePicUrl
              : "https://via.placeholder.com/150",
          }}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.username}>
            {userData ? userData.username : "Username"}
          </Text>
          <View style={styles.followContainer}>
            <Text style={styles.followCount}>
              {userData ? userData.followers : 0} Followers
            </Text>
            <Text style={styles.followCount}>
              {userData ? userData.following : 0} Following
            </Text>
          </View>
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
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  followContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  followCount: {
    fontSize: 16,
  },
  bio: {
    fontSize: 14,
    color: "#888",
  },
  postImage: {
    width: imageSize,
    height: imageSize,
  },
});
