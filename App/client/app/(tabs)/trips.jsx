import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const trips = () => {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1">
        <Text>trips</Text>
      </View>
    </SafeAreaView>
  )
}

export default trips