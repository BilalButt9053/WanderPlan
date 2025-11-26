import React, { useState } from 'react';
import { 
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { 
  DollarSign, 
  MapPin, 
  Calendar, 
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Edit3
} from 'lucide-react-native';
import  WanderButton  from '../components/wander-button';
import  WanderCard  from '../components/wander-card';
import { SafeAreaView } from 'react-native-safe-area-context';

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR'];
const popularDestinations = [
  'Paris, France',
  'Tokyo, Japan',
  'Bali, Indonesia',
  'New York, USA',
  'Barcelona, Spain',
  'Dubai, UAE',
];

export default function BudgetInputScreen({ onGeneratePlan, onManualCreate, onBack }) {
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);

  const handleGeneratePlan = () => {
    if (budget && destination && duration) {
      onGeneratePlan({ budget, currency, destination, duration });
    }
  };

  const filteredDestinations = destination
    ? popularDestinations.filter(d => 
        d.toLowerCase().includes(destination.toLowerCase())
      )
    : popularDestinations;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View style={{ 
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={onBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="#000" />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Plan Your Trip</Text>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>Let's start with the basics</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 24 }}>
        {/* Budget Input */}
        <WanderCard>
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <DollarSign size={18} color="#3B82F6" />
              <Text style={{ fontSize: 16, fontWeight: '500' }}>Total Budget</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  placeholder="5000"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  style={{
                    width: '100%',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 16,
                    fontSize: 16
                  }}
                />
              </View>
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  onPress={() => setShowCurrencies(!showCurrencies)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: '#F9FAFB',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    minWidth: 96,
                    zIndex:500,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{currency}</Text>
                  <ChevronDown size={16} color="#6B7280" />
                </TouchableOpacity>
                {showCurrencies && (
                  <View style={{
                    position: 'absolute',
                    top: '100%',
                    marginTop: 8,
                    right: 0,
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                    width: 128,
                    zIndex: 50
                  }}>
                    {currencies.map((curr) => (
                      <TouchableOpacity
                        key={curr}
                        onPress={() => {
                          setCurrency(curr);
                          setShowCurrencies(false);
                        }}
                        style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                      >
                        <Text>{curr}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </WanderCard>

        {/* Destination Input */}
        <WanderCard>
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <MapPin size={18} color="#3B82F6" />
              <Text style={{ fontSize: 16, fontWeight: '500' }}>Destination</Text>
            </View>
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Where do you want to go?"
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  setShowDestinations(true);
                }}
                onFocus={() => setShowDestinations(true)}
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 16,
                  fontSize: 16
                }}
              />
              {showDestinations && destination.length >= 0 && filteredDestinations.length > 0 && (
                <View style={{
                  position: 'absolute',
                  top: '100%',
                  marginTop: 8,
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                  maxHeight: 192,
                  zIndex: 500
                }}>
                  <ScrollView>
                    {filteredDestinations.map((dest) => (
                      <TouchableOpacity
                        key={dest}
                        onPress={() => {
                          setDestination(dest);
                          setShowDestinations(false);
                        }}
                        style={{ 
                          paddingHorizontal: 16, 
                          paddingVertical: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8
                        }}
                      >
                        <MapPin size={14} color="#6B7280" />
                        <Text>{dest}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </WanderCard>

        {/* Duration Input */}
        <WanderCard>
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Calendar size={18} color="#3B82F6" />
              <Text style={{ fontSize: 16, fontWeight: '500' }}>Duration</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TextInput
                placeholder="7"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: '#F9FAFB',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 16,
                  fontSize: 16
                }}
              />
              <Text style={{ color: '#6B7280' }}>days</Text>
            </View>
          </View>
        </WanderCard>

        {/* AI Generate Button */}
        <TouchableOpacity
          onPress={handleGeneratePlan}
          disabled={!budget || !destination || !duration}
          style={{
            backgroundColor: (!budget || !destination || !duration) ? '#9CA3AF' : '#3B82F6',
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5
          }}
        >
          <Sparkles size={20} color="#ffffff" />
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
            Generate Plan with AI
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          <Text style={{ fontSize: 13, color: '#6B7280' }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
        </View>

        {/* Manual Create Button */}
        <TouchableOpacity
          onPress={onManualCreate}
          style={{
            backgroundColor: '#ffffff',
            paddingVertical: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 2,
            borderColor: '#3B82F6'
          }}
        >
          <Edit3 size={20} color="#3B82F6" />
          <Text style={{ color: '#3B82F6', fontSize: 16, fontWeight: '600' }}>
            Create Trip Manually
          </Text>
        </TouchableOpacity>

        {/* Info Card */}
        <WanderCard style={{ backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Sparkles size={20} color="#3B82F6" style={{ marginTop: 4 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#3B82F6', marginBottom: 4 }}>
                AI-Powered Planning
              </Text>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>
                Our AI will analyze your budget and create an optimized itinerary with the best places to visit, eat, and stay.
              </Text>
            </View>
          </View>
        </WanderCard>
      </ScrollView>
    </SafeAreaView>
  );
}
