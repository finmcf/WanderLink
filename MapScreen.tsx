import React, { useContext } from "react";
import { View, Button, Text } from "react-native";
import MapView from "react-native-maps";
import { AppContext } from "./AppContext"; // Import AppContext

export const MapScreen = ({ navigation, route }: any) => {
  const { location } = useContext(AppContext); // Extract location from AppContext

  console.log(location); // Debugging line to check the value of location

  return (
    <View style={{ flex: 1 }}>
      {location ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          provider="google"
        />
      ) : (
        <Text>No location available</Text> // Display message when location is not available
      )}
    </View>
  );
};
