import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteField } from "firebase/firestore";

const SendFriendRequestButton = ({ loggedInUserId, profileUserId }) => {
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const fetchFriendRequestStatus = async () => {
      const docRef = doc(db, "Users", loggedInUserId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setRequestSent(
          userData.friendRequestsSent &&
            userData.friendRequestsSent.hasOwnProperty(profileUserId)
        );
      }
    };

    fetchFriendRequestStatus();
  }, [loggedInUserId, profileUserId]);

  const handleSendRequest = async () => {
    const timestamp = new Date().toISOString();
    try {
      // Add to loggedInUser's sent requests
      await updateDoc(doc(db, "Users", loggedInUserId), {
        [`friendRequestsSent.${profileUserId}`]: timestamp,
      });

      // Add to profileUser's received requests
      await updateDoc(doc(db, "Users", profileUserId), {
        [`friendRequestsReceived.${loggedInUserId}`]: timestamp,
      });

      setRequestSent(true);
    } catch (error) {
      alert(error);
    }
  };

  const handleCancelRequest = async () => {
    try {
      // Remove from loggedInUser's sent requests
      await updateDoc(doc(db, "Users", loggedInUserId), {
        [`friendRequestsSent.${profileUserId}`]: deleteField(),
      });

      // Remove from profileUser's received requests
      await updateDoc(doc(db, "Users", profileUserId), {
        [`friendRequestsReceived.${loggedInUserId}`]: deleteField(),
      });

      setRequestSent(false);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (requestSent) {
          Alert.alert(
            "Cancel Friend Request",
            "Do you want to cancel the friend request?",
            [
              {
                text: "Cancel",
                onPress: handleCancelRequest,
                style: "cancel",
              },
              {
                text: "No",
                style: "destructive",
              },
            ],
            { cancelable: false }
          );
        } else {
          handleSendRequest();
        }
      }}
    >
      <Text>{requestSent ? "Request Sent" : "Send Friend Request"}</Text>
    </TouchableOpacity>
  );
};

export default SendFriendRequestButton;
