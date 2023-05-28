import React, { useContext } from "react";
import { View, Button, Text } from "react-native";
import MapView from "react-native-maps";
import { LocationContext } from "./LocationContext"; // Add this import

export const MapScreen = ({ navigation, route }: any) => {
  const location = useContext(LocationContext); // Use useContext to get the location

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
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate("Profile")}
      />
    </View>
  );
};
