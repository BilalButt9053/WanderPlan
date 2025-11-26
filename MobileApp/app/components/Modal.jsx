import React from "react";
import { Modal as RNModal, View, TouchableOpacity, Text } from "react-native";
import { X } from "lucide-react-native";

export default function ReusableModal({
  visible,
  onClose,
  title,
  children,
  showClose = true,
  width = "90%",
}) {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-6">

        {/* MODAL BOX */}
        <View
          className="bg-white rounded-2xl p-6"
          style={{ width, maxHeight: '80%' }}
        >
          {/* CLOSE BUTTON */}
          {showClose && (
            <TouchableOpacity
              className="absolute right-4 top-4 z-10"
              onPress={onClose}
            >
              <X size={22} color="#333" />
            </TouchableOpacity>
          )}

          {/* TITLE */}
          {title && (
            <Text className="text-2xl font-semibold text-center mb-4">
              {title}
            </Text>
          )}

          {/* CHILD CONTENT */}
          {children}
        </View>
      </View>
    </RNModal>
  );
}
