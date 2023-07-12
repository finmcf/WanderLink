import React, { useContext, useState, useEffect } from "react";
import { Button, Platform } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import { useRoute } from "@react-navigation/native";
import { db, storage } from "./firebaseConfig";
import { AppContext } from "./AppContext";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

const ChatScreen = () => {
  const { user } = useContext(AppContext);
  const route = useRoute();
  const conversationId = route.params?.conversationId;

  const [messages, setMessages] = useState<GiftedChatMessage[]>([]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();

    const messagesRef = collection(
      db,
      `conversations/${conversationId}/messages`
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
            _id: data.userId,
            name: data.userName,
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
      `conversations/${conversationId}/messages`
    );

    const promises = newMessages.map(async (message) => {
      const { text, image, video } = message;

      let imageUrl, videoUrl;

      if (image || video) {
        const fileRef = ref(storage, `messages/${message._id}`);
        const uploadTask = uploadBytesResumable(fileRef, image || video);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // You can monitor the upload progress here
            },
            (error) => {
              console.log("Upload error:", error);
              reject(error);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL);
              });
            }
          );
        });

        if (image) imageUrl = await getDownloadURL(fileRef);
        if (video) videoUrl = await getDownloadURL(fileRef);
      }

      const timestamp = new Date().getTime();
      await addDoc(messagesRef, {
        text,
        image: imageUrl,
        video: videoUrl,
        userId: user?.uid,
        userName: user?.displayName,
        timestamp,
      });
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
      renderBubble={renderBubble}
      renderActions={() => <Button title="Pick Image" onPress={pickImage} />}
    />
  );
};

export default ChatScreen;
