import React, { useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { OtherUserProfileScreen } from "./OtherUserProfileScreen";

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
import ProfilePictureCameraScreen from "./ProfilePictureCameraScreen";
import { AppProvider, AppContext } from "./AppContext";

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
    })}
  >
    <BottomTab.Screen name="Profile" component={ProfileScreen} />
    <BottomTab.Screen name="Social" component={SocialTabScreen} />
    <BottomTab.Screen
      name="Camera"
      component={CameraScreen}
      options={{ tabBarStyle: { display: "none" } }}
    />
    <BottomTab.Screen name="Chat" component={ChatScreen} />
    <BottomTab.Screen name="Settings" component={SettingsScreen} />
  </BottomTab.Navigator>
);

export default function App() {
  const { setPreviousScreen } = useContext(AppContext);

  const handleStateChange = (state: any) => {
    const rootState = state?.routes[state.index]?.state; // Access the state of the root navigator
    const currentTabName = rootState?.routes[rootState.index]?.name; // Get the current tab name
    const currentTabState = rootState?.routes[rootState.index]?.state; // Access the state of the current tab navigator
    const currentScreenName =
      currentTabState?.routes[currentTabState.index]?.name; // Get the current screen name within the tab navigator

    if (setPreviousScreen) {
      setPreviousScreen({
        tabName: currentTabName,
        screenName: currentScreenName,
      });
    }
  };

  return (
    <AppProvider>
      <NavigationContainer onStateChange={handleStateChange}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="CountrySelect" component={CountrySelectScreen} />
          <Stack.Screen name="Main" component={MainTabScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen
            name="ProfilePictureCameraScreen"
            component={ProfilePictureCameraScreen}
          />

          <Stack.Screen
            name="OtherUserProfile"
            component={OtherUserProfileScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
