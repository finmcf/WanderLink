import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import { ProfileScreen } from "./ProfileScreen";
import CameraScreen from "./CameraScreen";
import SettingsScreen from "./SettingsScreen";
import { ChatScreen } from "./ChatScreen";
import SocialScreen from "./SocialScreen";
import SearchScreen from "./SearchScreen";
import { MapScreen } from "./MapScreen";
import CountrySelectScreen from "./CountrySelectScreen";
import { LocationProvider } from "./LocationContext"; // Add this import

const Stack = createStackNavigator();
const BottomTab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

const SocialTabScreen = ({ route }: any) => (
  <TopTab.Navigator>
    <TopTab.Screen name="SocialHome" component={SocialScreen} />
    <TopTab.Screen name="Map" component={MapScreen} />
  </TopTab.Navigator>
);

const MainTabScreen = () => (
  <BottomTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = "";
        switch (route.name) {
          case "Profile":
            iconName = "person";
            break;
          case "Social":
            iconName = "people";
            break;
          case "Camera":
            iconName = "camera";
            break;
          case "Chat":
            iconName = "chatbubble";
            break;
          case "Settings":
            iconName = "settings";
            break;
        }

        iconName += focused ? "" : "-outline";

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "tomato",
      tabBarInactiveTintColor: "gray",
      tabBarStyle: { display: "flex" },
    })}
  >
    <BottomTab.Screen name="Profile" component={ProfileScreen} />
    <BottomTab.Screen name="Social" component={SocialTabScreen} />
    <BottomTab.Screen name="Camera" component={CameraScreen} />
    <BottomTab.Screen name="Chat" component={ChatScreen} />
    <BottomTab.Screen name="Settings" component={SettingsScreen} />
  </BottomTab.Navigator>
);

export default function App() {
  return (
    <LocationProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="CountrySelect" component={CountrySelectScreen} />
          <Stack.Screen name="Main" component={MainTabScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </LocationProvider>
  );
}
