import React from "react";
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

// Fake data for demonstration
const posts = Array(20)
  .fill()
  .map((_, i) => ({ id: i, image: "https://via.placeholder.com/150" }));
const followers = 1500;
const following = 500;
const bio = "This is a bio!";

// Get screen width
const windowWidth = Dimensions.get("window").width;
const imageSize = windowWidth / 2; // divide by number of columns

export const ProfileScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <View>
      <Image source={{ uri: item.image }} style={styles.postImage} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          style={styles.profilePic}
          source={{ uri: "https://via.placeholder.com/150" }} // replace with profile picture URI
        />
        <View style={styles.profileDetails}>
          <Text style={styles.username}>Username</Text>
          <View style={styles.followContainer}>
            <Text style={styles.followCount}>{followers} Followers</Text>
            <Text style={styles.followCount}>{following} Following</Text>
          </View>
          <Text style={styles.bio}>{bio}</Text>
        </View>
        <Ionicons
          name="settings-outline"
          size={24}
          color="black"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
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
