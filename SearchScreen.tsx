import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import { db } from "./firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  startAt,
  endAt,
} from "firebase/firestore";

const SearchScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setSearchResults([]);
      return;
    }

    const usersRef = collection(db, "Users");
    const q = query(
      usersRef,
      orderBy("username"),
      startAt(searchText),
      endAt(searchText + "\uf8ff")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map((documentSnapshot) => {
        return {
          _id: documentSnapshot.id,
          name: documentSnapshot.data().username,
          profilePictureUrl: documentSnapshot.data().profilePictureUrl,
        };
      });

      setSearchResults(users);
    });

    // Unsubscribe from events when no longer in use
    return () => unsubscribe();
  }, [searchText]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search for users..."
      />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <Image
              style={styles.profilePicture}
              source={{ uri: item.profilePictureUrl }}
            />
            <Text style={styles.username}>{item.name}</Text>
          </View>
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
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  username: {
    fontSize: 18,
  },
});

export default SearchScreen;
