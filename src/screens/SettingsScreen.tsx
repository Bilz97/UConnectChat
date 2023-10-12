import { View, Text } from "react-native";
import { TextInput, Button } from "react-native";
import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-200">
      <View className={"flex-1 items-center"}>
        <Text>{"This is the future Settings screen"}</Text>
        <View className={"justify-center h-80 w-80"}>
          <Text>{"Enter username"}</Text>
          <TextInput></TextInput>
          <Button
            title="go to next screen"
            onPress={() => console.log("*** ")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
