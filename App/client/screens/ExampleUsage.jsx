// Example usage in a component
// screens/ExampleUsage.jsx

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  useLoginMutation, 
  useGetTripsQuery 
} from '../redux/apiSlice';
import { 
  setCredentials, 
  logout, 
  selectCurrentUser,
  selectIsAuthenticated 
} from '../redux/authSlice';

export default function ExampleUsage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // RTK Query hooks
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const { data: trips, isLoading: isLoadingTrips, error } = useGetTripsQuery(
    undefined, // query argument (none needed for getTrips)
    { skip: !isAuthenticated } // skip if not authenticated
  );

  const handleLogin = async () => {
    try {
      const result = await login({
        email: 'user@example.com',
        password: 'password123'
      }).unwrap();
      
      // Store credentials in Redux
      dispatch(setCredentials({
        user: result.user,
        token: result.token
      }));
      
      console.log('Login successful!');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Redux + RTK Query Example
      </Text>

      {!isAuthenticated ? (
        <TouchableOpacity 
          onPress={handleLogin}
          disabled={isLoggingIn}
          style={{ 
            backgroundColor: '#007AFF', 
            padding: 15, 
            borderRadius: 10 
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={{ marginBottom: 10 }}>
            Welcome, {user?.name || 'User'}!
          </Text>
          
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ 
              backgroundColor: '#FF3B30', 
              padding: 15, 
              borderRadius: 10,
              marginBottom: 20
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Logout
            </Text>
          </TouchableOpacity>

          {isLoadingTrips ? (
            <ActivityIndicator size="large" />
          ) : error ? (
            <Text>Error loading trips: {error.message}</Text>
          ) : (
            <View>
              <Text style={{ fontSize: 18, marginBottom: 10 }}>
                Your Trips:
              </Text>
              {trips?.map((trip) => (
                <Text key={trip.id}>{trip.name}</Text>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}
