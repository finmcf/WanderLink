import React, { useEffect, useState } from "react";
import { View, Button, Alert } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";

export const MapScreen = ({ navigation }: any) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {location && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          provider="google" // Remove this line to use Apple Maps on iOS
        />
      )}
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate("Profile")}
      />
    </View>
  );
};
