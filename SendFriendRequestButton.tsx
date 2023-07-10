import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteField } from "firebase/firestore";

const SendFriendRequestButton = ({ loggedInUserId, profileUserId }) => {
  const [requestSent, setRequestSent] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [requestReceived, setRequestReceived] = useState(false);

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
        setIsFriend(
          userData.friends && userData.friends.hasOwnProperty(profileUserId)
        );
        setRequestReceived(
          userData.friendRequestsReceived &&
            userData.friendRequestsReceived.hasOwnProperty(profileUserId)
        );
      }
    };

    fetchFriendRequestStatus();
  }, [loggedInUserId, profileUserId]);

  const handleSendRequest = async () => {
    if (requestSent || isFriend || requestReceived) {
      return;
    }

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

  const handleRemoveFriend = async () => {
    try {
      // Remove from loggedInUser's friends
      await updateDoc(doc(db, "Users", loggedInUserId), {
        [`friends.${profileUserId}`]: deleteField(),
      });

      // Remove from profileUser's friends
      await updateDoc(doc(db, "Users", profileUserId), {
        [`friends.${loggedInUserId}`]: deleteField(),
      });

      setIsFriend(false);
    } catch (error) {
      alert(error);
    }
  };

  const handlePress = () => {
    if (isFriend) {
      Alert.alert(
        "Remove Friend",
        "Are you sure you want to remove this friend?",
        [
          {
            text: "Yes",
            onPress: handleRemoveFriend,
            style: "destructive",
          },
          {
            text: "No",
            style: "cancel",
          },
        ],
        { cancelable: false }
      );
    } else if (requestSent) {
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
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>
        {isFriend
          ? "Remove Friend"
          : requestSent
          ? "Request Sent"
          : "Send Friend Request"}
      </Text>
    </TouchableOpacity>
  );
};

export default SendFriendRequestButton;
