import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { useRouter } from 'expo-router'

const profile = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    router.replace('/sign-in')
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4">Profile</Text>
        {user && (
          <View className="mb-6">
            <Text className="text-lg">Name: {user.fullName}</Text>
            <Text className="text-lg">Email: {user.email}</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default profile