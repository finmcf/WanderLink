import React, { useContext, useState, useEffect } from "react";
import { Button, Platform } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { useRoute } from "@react-navigation/native";
import { db, storage } from "./firebaseConfig";
import { AppContext } from "./AppContext";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

const ChatScreen = () => {
  const { user } = useContext(AppContext);
  const route = useRoute();
  const otherUserId = route.params?.userId;
  const conversationId = [user.uid, otherUserId].sort().join("_");

  const [messages, setMessages] = useState([]);
  const [conversationExists, setConversationExists] = useState(false);

  useEffect(() => {
    // Image permission
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();

    // Fetch conversation
    const fetchConversation = async () => {
      const conversationRef = doc(db, `Conversations`, conversationId);
      const conversationSnapshot = await getDoc(conversationRef);

      if (conversationSnapshot.exists()) {
        setConversationExists(true);
      }
    };

    fetchConversation();

    // Fetch messages
    const messagesRef = collection(
      db,
      `Conversations/${conversationId}/messages`
    );
    const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text,
          createdAt: new Date(data.timestamp),
          user: {
            _id: user?.uid,
            name: user?.userInformation?.username,
          },
          image: data.image,
          video: data.video,
        };
      });

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );
    });

    return unsubscribe;
  }, [conversationId]);

  const onSend = async (newMessages = []) => {
    const messagesRef = collection(
      db,
      `Conversations/${conversationId}/messages`
    );
    const conversationRef = doc(db, `Conversations`, conversationId);

    const timestamp = new Date().getTime();

    // Update both users' conversation array
    if (!conversationExists) {
      const user1Ref = doc(db, "Users", user.uid);
      const user2Ref = doc(db, "Users", otherUserId);

      await setDoc(
        user1Ref,
        { conversations: arrayUnion(conversationId) },
        { merge: true }
      );
      await setDoc(
        user2Ref,
        { conversations: arrayUnion(conversationId) },
        { merge: true }
      );

      setConversationExists(true);
    }

    // Save each message to firestore
    const promises = newMessages.map(async (message) => {
      const { text, image, video } = message;

      let imageUrl, videoUrl;

      // Upload images/videos
      if (image || video) {
        const fileRef = ref(storage, `messages/${message._id}`);
        const uploadTask = uploadBytesResumable(fileRef, image || video);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {},
            (error) => {
              console.log("Upload error:", error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });

        if (image) imageUrl = await getDownloadURL(fileRef);
        if (video) videoUrl = await getDownloadURL(fileRef);
      }

      await addDoc(messagesRef, {
        text,
        image: imageUrl || null,
        video: videoUrl || null,
        userId: user?.uid,
        userName: user?.displayName,
        timestamp,
      });

      // Update last message timestamp
      await setDoc(
        conversationRef,
        { lastMessageTimestamp: timestamp },
        { merge: true }
      );
    });

    await Promise.all(promises);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const newMessage = {
        _id: Math.random().toString(),
        text: "",
        createdAt: new Date(),
        user: {
          _id: user?.uid,
          name: user?.displayName,
        },
        image: result.uri,
      };

      await onSend([newMessage]);
    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{ _id: user?.uid }}
      renderActions={() => <Button title="Pick Image" onPress={pickImage} />}
    />
  );
};

export default ChatScreen;
