import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db, storage } from "./firebaseConfig";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  startAt,
  endAt,
  limit,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { AppContext } from "./AppContext";

const SearchScreen = () => {
  const { user } = useContext(AppContext);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeout = useRef(null);
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

  const loadUsers = useCallback(async () => {
    if (searchText.trim() === "") {
      setSearchResults([]);
      return;
    }

    const lowerCaseSearchText = searchText.toLowerCase();

    const usersRef = collection(db, "Users");
    const q = query(
      usersRef,
      orderBy("userInformation.lowercaseUsername"),
      startAt(lowerCaseSearchText),
      endAt(lowerCaseSearchText + "\uf8ff"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const users = await Promise.all(
        querySnapshot.docs.map(async (documentSnapshot) => {
          const data = documentSnapshot.data();
          const userInfo = data.userInformation || {};
          const profilePicUrl = await fetchProfilePicture(documentSnapshot.id);
          return {
            _id: documentSnapshot.id,
            name: userInfo.username,
            profilePictureUrl: profilePicUrl || userInfo.profilePicture,
          };
        })
      );

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

  const handleUserPress = (userId) => {
    // If selected user is the logged-in user, navigate to the ProfileScreen
    if (user && userId === user.uid) {
      navigation.navigate("Profile");
    } else {
      navigation.navigate("OtherUserProfile", { userId: userId });
    }
  };

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
          <TouchableOpacity
            style={styles.userContainer}
            onPress={() => handleUserPress(item._id)}
          >
            <Image
              source={{ uri: item.profilePictureUrl }}
              style={styles.profileImage}
            />
            <Text style={styles.username}>{item.name}</Text>
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
