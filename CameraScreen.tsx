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

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [zoom, setZoom] = useState(0);
  const [photoUri, setPhotoUri] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);
  const [key, setKey] = useState(0);

  const { location, user } = useContext(AppContext);

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

    console.log(result);

    if (!result.cancelled) {
      // Handle the selected image
    }
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
      console.log(location); // Log the location when a picture is taken
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
        {photoUri && (
          <View style={styles.takenPictureContainer}>
            <Image source={{ uri: photoUri }} style={styles.takenPicture} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                setPhotoUri(null);
                setIsCameraReady(false);
              }}
            >
              <Ionicons name="close-circle" size={36} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {!photoUri && (
          <>
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
                <Ionicons name="camera-reverse" size={36} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setFlashMode(
                    flashMode === Camera.Constants.FlashMode.off
                      ? Camera.Constants.FlashMode.torch
                      : Camera.Constants.FlashMode.off
                  );
                }}
              >
                <Ionicons name="flash" size={36} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                style={styles.takePictureButton}
                onPress={takePicture}
              >
                <View style={styles.innerCircle} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickImage}
              >
                <Ionicons name="images" size={36} color="white" />
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
});
