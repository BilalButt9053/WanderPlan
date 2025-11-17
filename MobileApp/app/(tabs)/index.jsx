
import { Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'

export default function Page() {
  const router = useRouter()
  const dispatch = useDispatch()
  // Read authenticated user from Redux auth slice
  const user = useSelector((state) => state.auth?.user || null)

  const handleLogout = () => {
    dispatch(logout())
    router.replace('/sign-in')
  }

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      {user ? (
        <View>
          <Text className="text-2xl font-bold mb-2">Hello {user.fullName || 'User'}!</Text>
          <Text className="text-gray-600 mb-6">{user.email}</Text>
          
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 py-3 rounded-xl"
          >
            <Text className="text-white text-center text-lg font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text className="text-center">Welcome — please sign in</Text>
      )}
    </View>
  )
}