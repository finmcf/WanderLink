import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { db } from "./firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

const SocialScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = collection(db, "Users");
    const unsubscribe = onSnapshot(usersRef, (querySnapshot) => {
      const users = querySnapshot.docs.map((documentSnapshot) => {
        return {
          _id: documentSnapshot.id,
          name: documentSnapshot.data().username,
        };
      });

      setUsers(users);
    });

    // Unsubscribe from events when no longer in use
    return () => unsubscribe();
  }, []);

  const handleSearch = () => {
    navigation.navigate("SearchScreen");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Search for users...</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Friends</Text>
      <ScrollView>
        {users.map((user, index) => (
          <View key={index} style={styles.friendContainer}>
            <Text style={styles.friendName}>{user.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  searchButton: {
    padding: 8,
    backgroundColor: "lightgray",
    borderRadius: 16,
    marginBottom: 16,
  },
  searchButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  friendContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  friendName: {
    fontSize: 18,
  },
});

export default SocialScreen;
