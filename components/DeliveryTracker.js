import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

/**
 * DeliveryTracker Component
 * 
 * Features:
 * - User enters delivery address
 * - Show route from store to customer
 * - Display distance and estimated time
 * - Real-time rider tracking (simulated)
 * - Turn-by-turn directions
 */

const DeliveryTracker = ({ orderId, storeLat = 5.6037, storeLng = -0.1870, onClose }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStarted, setTrackingStarted] = useState(false);

  // Map components (loaded dynamically for web)
  const [MapContainer, setMapContainer] = useState(null);
  const [TileLayer, setTileLayer] = useState(null);
  const [Marker, setMarker] = useState(null);
  const [Popup, setPopup] = useState(null);
  const [Polyline, setPolyline] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef(null);

  // Load Leaflet components on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Load Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Load react-leaflet
      import('react-leaflet')
        .then((module) => {
          setMapContainer(() => module.MapContainer);
          setTileLayer(() => module.TileLayer);
          setMarker(() => module.Marker);
          setPopup(() => module.Popup);
          setPolyline(() => module.Polyline);
          setMapLoaded(true);
        })
        .catch((error) => {
          console.error('Error loading map:', error);
        });
    }
  }, []);

  // Geocode address to coordinates using Nominatim (free OpenStreetMap service)
  const geocodeAddress = async (address) => {
    try {
      setIsSearching(true);
      const query = encodeURIComponent(`${address}, Accra, Ghana`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setDeliveryCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
        
        // Calculate route
        calculateRoute(
          { lat: storeLat, lng: storeLng },
          { lat: parseFloat(lat), lng: parseFloat(lon) }
        );
        
        return { lat: parseFloat(lat), lng: parseFloat(lon), display_name };
      } else {
        Alert.alert('Address Not Found', 'Please enter a valid address in Accra.');
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to find address. Please try again.');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // Calculate route using OSRM (free routing service)
  const calculateRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distance = (route.distance / 1000).toFixed(2); // Convert to km
        const duration = Math.ceil(route.duration / 60); // Convert to minutes
        
        // Convert geometry to Leaflet format
        const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        setRouteInfo({
          distance,
          duration,
          coordinates,
          steps: route.legs[0].steps || [],
        });

        // Initialize rider at store location
        setRiderLocation({ lat: start.lat, lng: start.lng });
      }
    } catch (error) {
      console.error('Routing error:', error);
      // Fallback: straight line
      setRouteInfo({
        distance: calculateDistance(start, end).toFixed(2),
        duration: Math.ceil(calculateDistance(start, end) * 3), // Estimate 3 min per km
        coordinates: [[start.lat, start.lng], [end.lat, end.lng]],
        steps: [],
      });
      setRiderLocation({ lat: start.lat, lng: start.lng });
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Simulate rider movement along route
  useEffect(() => {
    if (!isTracking || !routeInfo || !routeInfo.coordinates) return;

    let currentStep = 0;
    const totalSteps = routeInfo.coordinates.length;

    const interval = setInterval(() => {
      if (currentStep < totalSteps - 1) {
        currentStep++;
        const newLocation = routeInfo.coordinates[currentStep];
        setRiderLocation({ lat: newLocation[0], lng: newLocation[1] });

        // Calculate remaining distance and time
        const remainingCoords = routeInfo.coordinates.slice(currentStep);
        let remainingDistance = 0;
        for (let i = 0; i < remainingCoords.length - 1; i++) {
          remainingDistance += calculateDistance(
            { lat: remainingCoords[i][0], lng: remainingCoords[i][1] },
            { lat: remainingCoords[i + 1][0], lng: remainingCoords[i + 1][1] }
          );
        }

        setRouteInfo((prev) => ({
          ...prev,
          remainingDistance: remainingDistance.toFixed(2),
          remainingDuration: Math.ceil(remainingDistance * 3),
        }));
      } else {
        setIsTracking(false);
        Alert.alert('Delivery Complete!', 'Your order has been delivered. Enjoy your shoes! 👟');
        clearInterval(interval);
      }
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isTracking, routeInfo]);

  const handleSearchAddress = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Enter Address', 'Please enter your delivery address.');
      return;
    }
    await geocodeAddress(deliveryAddress);
  };

  const handleStartTracking = () => {
    if (!deliveryCoords) {
      Alert.alert('Set Location First', 'Please enter and confirm your delivery address.');
      return;
    }
    setIsTracking(true);
    setTrackingStarted(true);
  };

  // Mobile fallback view
  if (Platform.OS !== 'web') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delivery Tracking</Text>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={20} color="#5F5E5F" />
            </Pressable>
          )}
        </View>

        <View style={styles.mobileMessage}>
          <FontAwesome5 name="mobile-alt" size={48} color="#4A0404" />
          <Text style={styles.mobileTitle}>Mobile Tracking</Text>
          <Text style={styles.mobileText}>
            Full delivery tracking with live maps is available on the web version.
          </Text>
          {orderId && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Order ID:</Text>
              <Text style={styles.orderValue}>#{orderId}</Text>
            </View>
          )}
          <Text style={styles.mobileText}>
            We'll send you SMS updates about your delivery status.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🚚 Track Your Delivery</Text>
          {orderId && (
            <Text style={styles.headerSubtitle}>Order #{orderId}</Text>
          )}
        </View>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={20} color="#5F5E5F" />
          </Pressable>
        )}
      </View>

      {/* Address Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your address (e.g., Osu, Oxford Street)"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            editable={!trackingStarted}
          />
          <Pressable
            style={[styles.searchButton, isSearching && styles.searchButtonDisabled]}
            onPress={handleSearchAddress}
            disabled={isSearching || trackingStarted}
          >
            {isSearching ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <FontAwesome5 name="search" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Route Info */}
      {routeInfo && (
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoRow}>
            <View style={styles.routeInfoItem}>
              <FontAwesome5 name="route" size={20} color="#4A0404" />
              <Text style={styles.routeInfoLabel}>Distance</Text>
              <Text style={styles.routeInfoValue}>
                {routeInfo.remainingDistance || routeInfo.distance} km
              </Text>
            </View>
            <View style={styles.routeInfoItem}>
              <FontAwesome5 name="clock" size={20} color="#4A0404" />
              <Text style={styles.routeInfoLabel}>Est. Time</Text>
              <Text style={styles.routeInfoValue}>
                {routeInfo.remainingDuration || routeInfo.duration} min
              </Text>
            </View>
            <View style={styles.routeInfoItem}>
              <FontAwesome5 name="motorcycle" size={20} color="#4A0404" />
              <Text style={styles.routeInfoLabel}>Status</Text>
              <Text style={styles.routeInfoValue}>
                {isTracking ? 'On the way' : 'Ready'}
              </Text>
            </View>
          </View>

          {!trackingStarted && (
            <Pressable style={styles.startButton} onPress={handleStartTracking}>
              <FontAwesome5 name="play" size={16} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Tracking</Text>
            </Pressable>
          )}

          {isTracking && (
            <View style={styles.trackingStatus}>
              <ActivityIndicator color="#4A0404" />
              <Text style={styles.trackingText}>Tracking rider in real-time...</Text>
            </View>
          )}
        </View>
      )}

      {/* Map */}
      {mapLoaded && MapContainer && deliveryCoords && (
        <View style={styles.mapSection}>
          <MapContainer
            center={[storeLat, storeLng]}
            zoom={13}
            style={{ height: 500, width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Store Marker */}
            <Marker position={[storeLat, storeLng]}>
              <Popup>
                <div>
                  <strong>Osebo-Shoes Store</strong>
                  <p>Your order starts here</p>
                </div>
              </Popup>
            </Marker>

            {/* Customer Marker */}
            <Marker position={[deliveryCoords.lat, deliveryCoords.lng]}>
              <Popup>
                <div>
                  <strong>Your Location</strong>
                  <p>{deliveryAddress}</p>
                </div>
              </Popup>
            </Marker>

            {/* Rider Marker */}
            {riderLocation && isTracking && (
              <Marker position={[riderLocation.lat, riderLocation.lng]}>
                <Popup>
                  <div>
                    <strong>🚴 Dispatch Rider</strong>
                    <p>On the way to you!</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Route Polyline */}
            {routeInfo && routeInfo.coordinates && (
              <Polyline
                positions={routeInfo.coordinates}
                color="#4A0404"
                weight={4}
                opacity={0.7}
              />
            )}
          </MapContainer>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>How It Works</Text>
        <View style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>Enter your delivery address above</Text>
        </View>
        <View style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>Review the route and estimated time</Text>
        </View>
        <View style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>Click "Start Tracking" to begin</Text>
        </View>
        <View style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepText}>Watch the rider move on the map in real-time</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B1C1C',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5F5E5F',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B1C1C',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#4A0404',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
  },
  searchButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  routeInfoCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A0404',
  },
  routeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  routeInfoItem: {
    alignItems: 'center',
  },
  routeInfoLabel: {
    fontSize: 12,
    color: '#5F5E5F',
    marginTop: 8,
  },
  routeInfoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B1C1C',
    marginTop: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A0404',
    padding: 14,
    borderRadius: 8,
    gap: 10,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  trackingText: {
    fontSize: 14,
    color: '#4A0404',
    fontWeight: '600',
  },
  mapSection: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  instructionsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B1C1C',
    marginBottom: 16,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A0404',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#5F5E5F',
  },
  mobileMessage: {
    padding: 40,
    alignItems: 'center',
  },
  mobileTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B1C1C',
    marginTop: 16,
    marginBottom: 12,
  },
  mobileText: {
    fontSize: 16,
    color: '#5F5E5F',
    textAlign: 'center',
    marginBottom: 16,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    gap: 8,
  },
  orderLabel: {
    fontSize: 16,
    color: '#5F5E5F',
  },
  orderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A0404',
  },
});

export default DeliveryTracker;
