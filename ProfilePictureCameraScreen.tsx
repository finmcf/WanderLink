import React, { useState, useEffect, useRef, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Camera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { PinchGestureHandler, State } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import { AppContext } from "./AppContext";
import { storage } from "./firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [photoUri, setPhotoUri] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);
  const [key, setKey] = useState(0);

  const { location, user, setShouldRerenderProfile, previousScreen } =
    useContext(AppContext);

  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission =
        await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(
        cameraPermission.status === "granted" &&
          microphonePermission.status === "granted"
      );
    })();
  }, []);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener("focus", async () => {
      // Reset state variables
      setCameraType(Camera.Constants.Type.back);
      setFlashMode(Camera.Constants.FlashMode.off);
      setZoom(0);
      setPhotoUri(null);
      setIsCameraReady(false);
      setKey((prevKey) => prevKey + 1); // Force re-render of the camera

      // Re-request camera and microphone permissions
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission =
        await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(
        cameraPermission.status === "granted" &&
          microphonePermission.status === "granted"
      );
    });

    return () => {
      // Cleanup the event listener
      unsubscribeFocus();
    };
  }, [navigation]);

  useEffect(() => {
    if (!photoUri) {
      setKey((prevKey) => prevKey + 1);
    }
  }, [photoUri]);

  const onPinchEvent = (event) => {
    setZoom(event.nativeEvent.scale / 10);
  };

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setZoom(event.nativeEvent.scale / 10);
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadProfilePicture = async (uri) => {
    const uniqueImageId = `${user.uid}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}`;

    // Saving to a different folder in Firebase Storage
    const storageRef = ref(
      storage,
      `profilePictures/${user.uid}/${uniqueImageId}.jpg`
    );

    const response = await fetch(uri);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Error uploading image: ", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            console.log("File available at", downloadURL);

            const docRef = doc(db, "Users", user.uid);

            // Update the profilePicture field in Firestore with the new URL
            updateDoc(docRef, {
              profilePicture: {
                imageUrl: downloadURL,
                timestamp: Date.now(),
              },
            })
              .then(() => {
                console.log("Document updated");
                setShouldRerenderProfile(true); // Set shouldRerenderProfile to true after successful upload
              })
              .catch((error) => {
                console.error("Error updating document: ", error);
              });
          })
          .catch((error) => {
            console.error("Error getting download URL: ", error);
          });
      }
    );
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
    }
  };

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <Camera
        key={key}
        style={{ flex: 1 }}
        type={cameraType}
        flashMode={flashMode}
        zoom={zoom}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      >
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (previousScreen) {
                navigation.navigate(previousScreen.tabName, {
                  screen: previousScreen.screenName,
                });
              } else {
                navigation.goBack(); // Fallback to just going back
              }
            }}
          >
            <Ionicons name="arrow-back" size={36} color="white" />
          </TouchableOpacity>
        </View>
        {photoUri ? (
          <View style={styles.takenPictureContainer}>
            <Image source={{ uri: photoUri }} style={styles.takenPicture} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setPhotoUri(null)}
            >
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => uploadProfilePicture(photoUri)} // Use the updated function here
            >
              <Ionicons name="cloud-upload" size={36} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.topButtonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  setCameraType(
                    cameraType === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  )
                }
              >
                <Ionicons name="camera-reverse" size={36} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  setFlashMode(
                    flashMode === Camera.Constants.FlashMode.off
                      ? Camera.Constants.FlashMode.torch
                      : Camera.Constants.FlashMode.off
                  )
                }
              >
                <Ionicons name="flash" size={36} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Ionicons name="images" size={36} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <View style={styles.captureCircle} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}>
                <Ionicons name="images-outline" size={36} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </Camera>
    </PinchGestureHandler>
  );
}

const styles = StyleSheet.create({
  topButtonContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 20,
    left: 20,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    margin: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 10,
  },
  uploadButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 10,
  },
  takePictureButton: {
    alignSelf: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "white",
    borderRadius: 50,
    height: 70,
    width: 70,
    justifyContent: "center",
  },
  innerCircle: {
    backgroundColor: "transparent",
    borderRadius: 30,
    height: 60,
    width: 60,
  },
  galleryButton: {
    position: "absolute",
    right: 20,
    alignSelf: "center",
  },
  takenPictureContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  takenPicture: {
    width: "100%",
    height: "100%",
  },
  captureButton: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 50,
    height: 70,
    width: 70,
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "white",
  },
  captureCircle: {
    backgroundColor: "white",
    borderRadius: 35,
    height: 60,
    width: 60,
  },
  backButtonContainer: {
    position: "absolute",
    top: 20,
    left: 200,
  },
  backButton: {
    padding: 10,
  },
});
