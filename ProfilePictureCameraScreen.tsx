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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export default function ProfilePictureCameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [zoom, setZoom] = useState(0);
  const [photoUri, setPhotoUri] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);
  const [key, setKey] = useState(0);

  const { user } = useContext(AppContext);

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

  const uploadImage = async (uri) => {
    const uniqueImageId = `${user.uid}_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}`;

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

            updateDoc(docRef, {
              profilePicture: downloadURL,
            })
              .then(() => {
                console.log("Document updated");
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

  const takePicture = async () => {
    if (isCameraReady) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
    }
  };

  const renderCameraContent = () => (
    <View style={{ flex: 1 }}>
      <Camera
        key={key}
        style={{ flex: 1 }}
        type={cameraType}
        zoom={zoom}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      >
        <View style={styles.topButtonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setCameraType(
                cameraType === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Ionicons name="camera-reverse-outline" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureCircle} />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );

  const renderTakenPictureContent = () => (
    <View style={styles.takenPictureContainer}>
      <Image source={{ uri: photoUri }} style={styles.takenPicture} />
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setPhotoUri(null)}
      >
        <Text style={{ color: "white", fontSize: 18 }}>Delete</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => uploadImage(photoUri)}
      >
        <Text style={{ color: "white", fontSize: 18 }}>Use Photo</Text>
      </TouchableOpacity>
    </View>
  );

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <View style={{ flex: 1 }}>
        {photoUri ? renderTakenPictureContent() : renderCameraContent()}
      </View>
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
});
