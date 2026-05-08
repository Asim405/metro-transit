/**
 * Metro Transit Live - React Native App
 * 
 * Features:
 * - Minimalist, professional UI with Tailwind CSS (NativeWind)
 * - High contrast, clear typography
 * - Real-time schedule fetching from database view
 * - Booking functionality with ACID transaction support
 * - Bottom tab navigation (Home, Bookings, Profile)
 * 
 * Built with:
 * - React Native (Expo)
 * - React Navigation
 * - NativeWind (Tailwind CSS)
 * - Axios for API calls
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// API CONFIGURATION
// ============================================================
const API_BASE_URL = 'http://10.0.2.2:5000'; // Android emulator localhost
// For physical device, use your actual IP address:
// const API_BASE_URL = 'http://192.168.x.x:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ============================================================
// NAVIGATION SETUP
// ============================================================
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================================
// HOME SCREEN - Display Active Schedules
// ============================================================
const HomeScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  // Fetch schedules from API
  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/schedules');
      
      if (response.data.success) {
        setSchedules(response.data.data);
        setFilteredSchedules(response.data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      Alert.alert('Connection Error', 'Cannot connect to backend. Make sure server is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = schedules;

    if (searchOrigin) {
      filtered = filtered.filter(s =>
        s.origin_station.toLowerCase().includes(searchOrigin.toLowerCase())
      );
    }

    if (searchDestination) {
      filtered = filtered.filter(s =>
        s.destination_station.toLowerCase().includes(searchDestination.toLowerCase())
      );
    }

    setFilteredSchedules(filtered);
  }, [searchOrigin, searchDestination, schedules]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

  const handleBooking = (schedule) => {
    navigation.navigate('BookingDetails', { schedule });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateDuration = (departure, arrival) => {
    const diff = new Date(arrival) - new Date(departure);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="px-4 py-4 bg-slate-900 border-b-4 border-blue-600">
        <Text className="text-3xl font-bold text-white">MetroTransit Live</Text>
        <Text className="text-blue-300 text-sm mt-1">Real-time Transit Management</Text>
      </View>

      {/* Search Section */}
      <View className="px-4 py-4 bg-gray-50 border-b border-gray-200">
        <Text className="text-sm font-semibold text-gray-700 mb-3">Search Routes</Text>
        
        <View className="mb-3">
          <TextInput
            className="border-2 border-gray-300 rounded-lg px-4 py-2 text-base bg-white"
            placeholder="From (e.g., Central Station)"
            value={searchOrigin}
            onChangeText={setSearchOrigin}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View>
          <TextInput
            className="border-2 border-gray-300 rounded-lg px-4 py-2 text-base bg-white"
            placeholder="To (e.g., Grand Central)"
            value={searchDestination}
            onChangeText={setSearchDestination}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Text className="text-xs text-gray-500 mt-2">
          Found {filteredSchedules.length} schedules
        </Text>
      </View>

      {/* Schedules List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !schedules.length && (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#0369a1" />
            <Text className="text-gray-600 mt-2">Loading schedules...</Text>
          </View>
        )}

        {!loading && filteredSchedules.length === 0 && (
          <View className="py-8 justify-center items-center">
            <Text className="text-gray-500 text-lg">No schedules found</Text>
            <Text className="text-gray-400 text-sm mt-1">Try adjusting your search</Text>
          </View>
        )}

        {filteredSchedules.map((schedule) => (
          <View
            key={schedule.schedule_id}
            className="mb-4 bg-white border-l-4 border-blue-600 rounded-lg overflow-hidden shadow-md"
          >
            {/* Schedule Card Header */}
            <View className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold text-slate-900">
                  {schedule.origin_station}
                </Text>
                <View className="px-2 py-1 bg-blue-600 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {schedule.vehicle_type}
                  </Text>
                </View>
              </View>
              <Text className="text-sm font-semibold text-blue-600">
                → {schedule.destination_station}
              </Text>
            </View>

            {/* Schedule Card Content */}
            <View className="px-4 py-3 border-b border-gray-200">
              <View className="flex-row justify-between items-center mb-3">
                <View>
                  <Text className="text-xs text-gray-500 font-semibold">Departure</Text>
                  <Text className="text-lg font-bold text-slate-900">
                    {formatDateTime(schedule.departure_time)}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">
                    {calculateDuration(schedule.departure_time, schedule.arrival_time)}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">{schedule.distance_km} km</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-500 font-semibold">Arrival</Text>
                  <Text className="text-lg font-bold text-slate-900">
                    {formatDateTime(schedule.arrival_time)}
                  </Text>
                </View>
              </View>

              <View className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-xs text-gray-500">Seats Available</Text>
                    <Text className="text-lg font-bold text-green-600">
                      {schedule.available_seats}/{schedule.total_seats}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-gray-500">Fare</Text>
                    <Text className="text-lg font-bold text-slate-900">
                      ${schedule.fare_amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text className="text-xs text-gray-600">
                Operator: <Text className="font-semibold">{schedule.operator_name}</Text>
              </Text>
            </View>

            {/* Book Button */}
            <TouchableOpacity
              onPress={() => handleBooking(schedule)}
              className={`px-4 py-3 ${
                schedule.available_seats > 0
                  ? 'bg-blue-600'
                  : 'bg-gray-400'
              }`}
              disabled={schedule.available_seats <= 0}
            >
              <Text className="text-white text-center font-bold text-base">
                {schedule.available_seats > 0 ? 'BOOK NOW' : 'SOLD OUT'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View className="pb-4" />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================
// BOOKING DETAILS SCREEN - Booking with Transaction Logic
// ============================================================
const BookingDetailsScreen = ({ route, navigation }) => {
  const { schedule } = route.params;
  const [numSeats, setNumSeats] = useState('1');
  const [userId, setUserId] = useState('1');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const totalPrice = parseFloat(schedule.fare_amount) * parseInt(numSeats || 1);

  const handleConfirmBooking = async () => {
    if (!numSeats || parseInt(numSeats) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of seats');
      return;
    }

    if (parseInt(numSeats) > schedule.available_seats) {
      Alert.alert(
        'Not Enough Seats',
        `Only ${schedule.available_seats} seats available`
      );
      return;
    }

    setLoading(true);

    try {
      // Call API with ACID transaction
      const response = await api.post('/api/bookings/create', {
        user_id: parseInt(userId),
        schedule_id: schedule.schedule_id,
        num_seats: parseInt(numSeats),
        payment_amount: totalPrice,
      });

      if (response.data.success) {
        // Save booking to local storage
        const bookings = await AsyncStorage.getItem('bookings');
        const bookingsList = bookings ? JSON.parse(bookings) : [];
        bookingsList.push(response.data.data);
        await AsyncStorage.setItem('bookings', JSON.stringify(bookingsList));

        Alert.alert('Success', 'Booking confirmed successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setShowModal(false);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Booking Failed', response.data.message);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create booking'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Header */}
        <View className="mb-6 pb-4 border-b-2 border-blue-600">
          <Text className="text-2xl font-bold text-slate-900 mb-2">
            {schedule.origin_station} → {schedule.destination_station}
          </Text>
          <Text className="text-gray-600">
            {new Date(schedule.departure_time).toLocaleDateString()}
          </Text>
        </View>

        {/* Journey Details */}
        <View className="mb-6 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
          <Text className="text-sm font-bold text-gray-700 mb-3">Journey Details</Text>

          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Departure:</Text>
              <Text className="font-bold text-slate-900">
                {new Date(schedule.departure_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Arrival:</Text>
              <Text className="font-bold text-slate-900">
                {new Date(schedule.arrival_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Vehicle Type:</Text>
              <Text className="font-bold text-blue-600">{schedule.vehicle_type}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Available Seats:</Text>
              <Text className="font-bold text-green-600">
                {schedule.available_seats}/{schedule.total_seats}
              </Text>
            </View>
          </View>
        </View>

        {/* Seat Selection */}
        <View className="mb-6 bg-gray-50 rounded-lg p-4">
          <Text className="text-sm font-bold text-gray-700 mb-3">Select Number of Seats</Text>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="px-4 py-2 bg-slate-900 rounded-lg"
              onPress={() => setNumSeats(Math.max(1, parseInt(numSeats) - 1).toString())}
            >
              <Text className="text-white text-xl font-bold">−</Text>
            </TouchableOpacity>

            <TextInput
              className="border-2 border-gray-300 rounded-lg px-6 py-2 text-2xl font-bold text-center w-24"
              value={numSeats}
              onChangeText={setNumSeats}
              keyboardType="number-pad"
              maxLength={2}
            />

            <TouchableOpacity
              className="px-4 py-2 bg-blue-600 rounded-lg"
              onPress={() =>
                setNumSeats(
                  Math.min(
                    parseInt(numSeats) + 1,
                    schedule.available_seats
                  ).toString()
                )
              }
            >
              <Text className="text-white text-xl font-bold">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Summary */}
        <View className="mb-6 bg-slate-50 rounded-lg p-4 border-2 border-gray-200">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Fare per Seat:</Text>
            <Text className="font-semibold text-slate-900">
              ${schedule.fare_amount.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-600">Number of Seats:</Text>
            <Text className="font-semibold text-slate-900">{numSeats}</Text>
          </View>

          <View className="h-px bg-gray-300 mb-3" />

          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-slate-900">Total Amount:</Text>
            <Text className="text-2xl font-bold text-blue-600">
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* User Info */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-700 mb-2">User ID (for testing)</Text>
          <TextInput
            className="border-2 border-gray-300 rounded-lg px-4 py-2 text-base"
            value={userId}
            onChangeText={setUserId}
            keyboardType="number-pad"
            placeholder="Enter user ID"
          />
          <Text className="text-xs text-gray-500 mt-1">
            Default: 1 (demo user)
          </Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          className={`py-4 rounded-lg mb-4 ${
            loading ? 'bg-gray-400' : 'bg-blue-600'
          }`}
          onPress={() => setShowModal(true)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-center text-lg font-bold">
              PROCEED TO PAYMENT
            </Text>
          )}
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          className="py-3 rounded-lg border-2 border-gray-300"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-700 text-center text-base font-semibold">
            CANCEL
          </Text>
        </TouchableOpacity>

        <View className="pb-4" />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-slate-900 mb-4">
              Confirm Booking
            </Text>

            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <Text className="text-sm text-gray-600 mb-2">Route:</Text>
              <Text className="font-semibold text-slate-900 mb-3">
                {schedule.origin_station} → {schedule.destination_station}
              </Text>

              <Text className="text-sm text-gray-600 mb-2">Seats: {numSeats}</Text>
              <Text className="text-sm text-gray-600 mb-2">
                Total: <Text className="font-bold text-blue-600">${totalPrice.toFixed(2)}</Text>
              </Text>
            </View>

            <Text className="text-xs text-gray-500 mb-4 text-center">
              A transaction will be processed atomically (ACID guarantee)
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 bg-gray-300 rounded-lg"
                onPress={() => setShowModal(false)}
                disabled={loading}
              >
                <Text className="text-gray-700 font-bold text-center">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${
                  loading ? 'bg-gray-400' : 'bg-blue-600'
                }`}
                onPress={handleConfirmBooking}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-center">
                    CONFIRM & PAY
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ============================================================
// BOOKINGS SCREEN - View User Bookings
// ============================================================
const BookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('1');
  const [fetching, setFetching] = useState(false);

  const fetchUserBookings = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/api/bookings/${userId}`);

      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserBookings();
    }
  }, [userId]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="px-4 py-4 bg-slate-900 border-b-2 border-blue-600">
        <Text className="text-2xl font-bold text-white">My Bookings</Text>
      </View>

      {/* User ID Input */}
      <View className="px-4 py-4 bg-gray-50 border-b border-gray-200">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Enter User ID</Text>
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-base"
            value={userId}
            onChangeText={setUserId}
            keyboardType="number-pad"
            placeholder="User ID"
          />
          <TouchableOpacity
            className="px-4 py-2 bg-blue-600 rounded-lg justify-center"
            onPress={fetchUserBookings}
          >
            <Text className="text-white font-bold">Load</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bookings List */}
      <ScrollView className="flex-1 px-4 py-4">
        {fetching && (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#0369a1" />
          </View>
        )}

        {!fetching && bookings.length === 0 && (
          <View className="py-8 justify-center items-center">
            <Text className="text-gray-500 text-lg">No bookings found</Text>
          </View>
        )}

        {bookings.map((booking) => (
          <View
            key={booking.booking_id}
            className="mb-4 bg-white border-l-4 border-green-600 rounded-lg overflow-hidden shadow-md p-4"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-lg font-bold text-slate-900">
                  {booking.origin_station}
                </Text>
                <Text className="text-sm text-gray-600">
                  → {booking.destination_station}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  booking.booking_status === 'Active'
                    ? 'bg-green-100'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    booking.booking_status === 'Active'
                      ? 'text-green-700'
                      : 'text-gray-700'
                  }`}
                >
                  {booking.booking_status}
                </Text>
              </View>
            </View>

            <View className="bg-gray-50 rounded-lg p-3 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Date:</Text>
                <Text className="font-semibold text-slate-900">
                  {new Date(booking.departure_time).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Time:</Text>
                <Text className="font-semibold text-slate-900">
                  {new Date(booking.departure_time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Seats:</Text>
                <Text className="font-semibold text-slate-900">{booking.num_seats}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Price:</Text>
                <Text className="font-bold text-blue-600">
                  ${booking.total_price.toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View>
                <Text className="text-xs text-gray-500">Payment</Text>
                <Text
                  className={`text-xs font-bold ${
                    booking.payment_status === 'Confirmed'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {booking.payment_status}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs text-gray-500">Booking ID</Text>
                <Text className="text-xs font-bold text-slate-900">
                  #{booking.booking_id}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View className="pb-4" />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================
// PROFILE SCREEN - User Information & Settings
// ============================================================
const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="px-4 py-4 bg-slate-900 border-b-2 border-blue-600">
        <Text className="text-2xl font-bold text-white">Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* User Card */}
        <View className="bg-blue-50 rounded-lg p-6 mb-6 border-l-4 border-blue-600">
          <View className="w-16 h-16 rounded-full bg-blue-600 justify-center items-center mb-4">
            <Text className="text-3xl font-bold text-white">
              {userInfo.name.charAt(0)}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-slate-900 mb-1">
            {userInfo.name}
          </Text>
          <Text className="text-sm text-gray-600 mb-4">Regular Passenger</Text>

          <View className="bg-white rounded-lg p-3">
            <View className="mb-3">
              <Text className="text-xs text-gray-500 font-semibold mb-1">EMAIL</Text>
              <Text className="text-sm font-semibold text-slate-900">
                {userInfo.email}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500 font-semibold mb-1">PHONE</Text>
              <Text className="text-sm font-semibold text-slate-900">
                {userInfo.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View className="bg-gray-50 rounded-lg p-6">
          <Text className="text-lg font-bold text-slate-900 mb-4">About App</Text>

          <View className="mb-4 pb-4 border-b border-gray-200">
            <Text className="text-xs text-gray-500 font-semibold mb-1">APP NAME</Text>
            <Text className="text-sm text-slate-900">Metro Transit Live</Text>
          </View>

          <View className="mb-4 pb-4 border-b border-gray-200">
            <Text className="text-xs text-gray-500 font-semibold mb-1">VERSION</Text>
            <Text className="text-sm text-slate-900">1.0.0</Text>
          </View>

          <View>
            <Text className="text-xs text-gray-500 font-semibold mb-1">
              BACKEND URL
            </Text>
            <Text className="text-sm text-slate-900">{API_BASE_URL}</Text>
          </View>
        </View>

        <TouchableOpacity className="mt-6 py-3 bg-red-600 rounded-lg">
          <Text className="text-white text-center font-bold">Sign Out</Text>
        </TouchableOpacity>

        <View className="pb-4" />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================================
// MAIN APP NAVIGATION STRUCTURE
// ============================================================
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="HomeList" component={HomeScreen} />
    <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#0369a1',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        borderTopWidth: 2,
        borderTopColor: '#E5E7EB',
        paddingBottom: 5,
        paddingTop: 5,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{
        title: 'Schedules',
      }}
    />
    <Tab.Screen
      name="Bookings"
      component={BookingsScreen}
      options={{
        title: 'My Bookings',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: 'Profile',
      }}
    />
  </Tab.Navigator>
);

// ============================================================
// APP ENTRY POINT
// ============================================================
export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
