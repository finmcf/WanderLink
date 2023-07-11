import React, { useContext, useEffect } from "react";
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
import ProfilePictureCameraScreen from "./ProfilePictureCameraScreen";
import FriendRequestsScreen from "./FriendRequestsScreen";
import NotificationScreen from "./NotificationScreen";
import { OtherUserProfileScreen } from "./OtherUserProfileScreen";
import FriendListScreen from "./FriendListScreen"; // import as default
import { AppProvider, AppContext } from "./AppContext";

const Stack = createStackNavigator();
const BottomTab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();
const SocialStack = createStackNavigator();

const SocialStackScreen = () => (
  <SocialStack.Navigator>
    <SocialStack.Screen
      name="SocialHome"
      component={SocialScreen}
      options={{ headerShown: false }}
    />
    <SocialStack.Screen
      name="SearchScreen"
      component={SearchScreen}
      options={{ headerShown: false }}
    />
    <SocialStack.Screen
      name="OtherUserProfile"
      component={OtherUserProfileScreen}
      options={{ headerShown: false }}
    />
  </SocialStack.Navigator>
);

const SocialTopTabScreen = ({ route }) => (
  <TopTab.Navigator>
    <TopTab.Screen
      name="SocialScreen"
      component={SocialStackScreen}
      options={{ headerShown: false }}
    />
    <TopTab.Screen name="Map" component={MapScreen} />
  </TopTab.Navigator>
);

const NotificationsTopTabScreen = () => (
  <TopTab.Navigator>
    <TopTab.Screen name="FriendRequests" component={FriendRequestsScreen} />
    <TopTab.Screen name="NotificationsList" component={NotificationScreen} />
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
          case "Notifications":
            iconName = "notifications";
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
    <BottomTab.Screen name="Social" component={SocialTopTabScreen} />
    <BottomTab.Screen
      name="Camera"
      component={CameraScreen}
      options={{ tabBarStyle: { display: "none" } }}
    />
    <BottomTab.Screen name="Chat" component={ChatScreen} />
    <BottomTab.Screen name="Settings" component={SettingsScreen} />
    <BottomTab.Screen
      name="Notifications"
      component={NotificationsTopTabScreen}
    />
  </BottomTab.Navigator>
);

export default function App() {
  const { setPreviousScreen } = useContext(AppContext);

  const handleStateChange = (state) => {
    const rootState = state?.routes[state.index]?.state;
    const currentTabName = rootState?.routes[rootState.index]?.name;
    const currentTabState = rootState?.routes[rootState.index]?.state;
    const currentScreenName =
      currentTabState?.routes[currentTabState.index]?.name;

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
          <Stack.Screen
            name="ProfilePictureCameraScreen"
            component={ProfilePictureCameraScreen}
          />
          <Stack.Screen name="FriendListScreen" component={FriendListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
