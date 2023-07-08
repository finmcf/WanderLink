import React, { useState, useEffect, useContext } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db } from "./firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { AppContext } from "./AppContext";

const FriendRequestsScreen = () => {
  const { user } = useContext(AppContext);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchFriendRequests = async () => {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        const receivedRequests = Object.entries(
          userData.friendRequestsReceived || {}
        ).sort((a, b) => new Date(b[1]) - new Date(a[1])); // sort by timestamp descending
        setFriendRequests(receivedRequests);
      }
    };

    fetchFriendRequests();
  }, [user.uid]);

  const handleAcceptRequest = async (requesterId) => {
    const userRef = doc(db, "Users", user.uid);
    const requesterRef = doc(db, "Users", requesterId);

    // Transactionally update both users' friend lists and remove the request
    await updateDoc(userRef, {
      friends: arrayUnion(requesterId),
      friendRequestsReceived: { [requesterId]: arrayRemove() },
    });

    await updateDoc(requesterRef, {
      friends: arrayUnion(user.uid),
      friendRequestsSent: { [user.uid]: arrayRemove() },
    });

    // Update the UI
    setFriendRequests(
      friendRequests.filter((request) => request[0] !== requesterId)
    );
  };

  const handleRejectRequest = async (requesterId) => {
    const userRef = doc(db, "Users", user.uid);
    const requesterRef = doc(db, "Users", requesterId);

    // Transactionally remove the request
    await updateDoc(userRef, {
      friendRequestsReceived: { [requesterId]: arrayRemove() },
    });

    await updateDoc(requesterRef, {
      friendRequestsSent: { [user.uid]: arrayRemove() },
    });

    // Update the UI
    setFriendRequests(
      friendRequests.filter((request) => request[0] !== requesterId)
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Friend Requests</Text>
      <FlatList
        data={friendRequests}
        keyExtractor={(item) => item[0]} // Use the user id (first item in the pair) as the key
        renderItem={({ item }) => {
          const [requesterId, requestTimestamp] = item;
          return (
            <View style={styles.friendRequestItem}>
              <Text>User ID: {requesterId}</Text>
              <Text>
                Request sent at: {new Date(requestTimestamp).toLocaleString()}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleAcceptRequest(requesterId)}
                >
                  <Text>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleRejectRequest(requesterId)}
                >
                  <Text>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
  },
  friendRequestItem: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#eaeaea",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
  },
});

export default FriendRequestsScreen;
