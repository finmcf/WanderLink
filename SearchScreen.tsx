import React, { useState, useEffect, useRef, useCallback } from "react";
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
  limit,
} from "firebase/firestore";

const SearchScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeout = useRef(null);

  const loadUsers = useCallback(() => {
    if (searchText.trim() === "") {
      setSearchResults([]);
      return;
    }

    const usersRef = collection(db, "Users");
    const q = query(
      usersRef,
      orderBy("userInformation.username"),
      startAt(searchText),
      endAt(searchText + "\uf8ff"),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users = querySnapshot.docs.map((documentSnapshot) => {
        const data = documentSnapshot.data();
        const userInfo = data.userInformation || {};
        return {
          _id: documentSnapshot.id,
          name: userInfo.username,
          profilePictureUrl: userInfo.profilePicture,
        };
      });

      setSearchResults(users);
    });

    return unsubscribe;
  }, [searchText]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(loadUsers, 500);
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchText, loadUsers]);

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
              source={{ uri: item.profilePictureUrl }}
              style={styles.profileImage}
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
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 8,
  },
  username: {
    fontSize: 18,
  },
});

export default SearchScreen;
