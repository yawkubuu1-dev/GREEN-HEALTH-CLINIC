import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import MapComponent from './MapComponent';

/**
 * StoreLocator Component - Find Prolyn Wear Store Locations
 * 
 * This component provides a complete store locator experience with:
 * - Interactive map showing all store locations
 * - List of stores with contact details
 * - Get directions functionality
 */

const StoreLocator = ({ onClose }) => {
  const { width } = useWindowDimensions();
  const isPhone = width < 768;

  const [selectedStore, setSelectedStore] = useState(null);

  // Store locations with full details
  const stores = [
    {
      id: 1,
      name: 'Prolyn Wear Main Store',
      lat: 5.6037,
      lng: -0.1870,
      address: 'Oxford Street, Osu, Accra',
      phone: '+233 XX XXX XXXX',
      hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
      description: 'Visit our flagship store for the full Prolyn Wear experience',
    },
    {
      id: 2,
      name: 'Prolyn Wear Osu Branch',
      lat: 5.5560,
      lng: -0.1969,
      address: 'Ring Road Central, Accra',
      phone: '+233 XX XXX XXXY',
      hours: 'Mon-Sat: 9AM-7PM, Sun: Closed',
      description: 'Find premium footwear in our Osu location',
    },
    {
      id: 3,
      name: 'Prolyn Wear Mall Branch',
      lat: 5.6537,
      lng: -0.1658,
      address: 'Accra Mall, Spintex Road',
      phone: '+233 XX XXX XXXZ',
      hours: 'Mon-Sun: 10AM-9PM',
      description: 'Convenient mall location with extended hours',
    },
  ];

  const markers = stores.map((store) => ({
    lat: store.lat,
    lng: store.lng,
    title: store.name,
    description: store.address,
    id: store.id,
  }));

  const handleMarkerClick = (marker) => {
    const store = stores.find((s) => s.id === marker.id);
    setSelectedStore(store);
  };

  const handleGetDirections = (store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Find Our Stores</Text>
          <Text style={styles.headerSubtitle}>
            Visit any of our {stores.length} locations
          </Text>
        </View>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={20} color="#5F5E5F" />
          </Pressable>
        )}
      </View>

      {/* Map Section */}
      <View style={styles.mapSection}>
        <MapComponent
          center={[5.6037, -0.1870]}
          zoom={12}
          markers={markers}
          showStoreLocations={false}
          height={isPhone ? 300 : 450}
          onMarkerClick={handleMarkerClick}
        />
      </View>

      {/* Selected Store Details */}
      {selectedStore && (
        <View style={styles.selectedStoreCard}>
          <Text style={styles.selectedStoreTitle}>{selectedStore.name}</Text>
          <View style={styles.storeDetailRow}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#4A0404" />
            <Text style={styles.storeDetailText}>{selectedStore.address}</Text>
          </View>
          <View style={styles.storeDetailRow}>
            <FontAwesome5 name="phone" size={14} color="#4A0404" />
            <Text style={styles.storeDetailText}>{selectedStore.phone}</Text>
          </View>
          <View style={styles.storeDetailRow}>
            <FontAwesome5 name="clock" size={14} color="#4A0404" />
            <Text style={styles.storeDetailText}>{selectedStore.hours}</Text>
          </View>
          <Pressable
            style={styles.directionsButton}
            onPress={() => handleGetDirections(selectedStore)}
          >
            <FontAwesome5 name="directions" size={16} color="#FFFFFF" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </Pressable>
        </View>
      )}

      {/* Store List */}
      <View style={styles.storeList}>
        <Text style={styles.storeListTitle}>All Locations</Text>
        {stores.map((store) => (
          <Pressable
            key={store.id}
            style={[
              styles.storeCard,
              selectedStore?.id === store.id && styles.storeCardSelected,
            ]}
            onPress={() => setSelectedStore(store)}
          >
            <View style={styles.storeCardHeader}>
              <View style={styles.storeIconContainer}>
                <FontAwesome5 name="store" size={20} color="#4A0404" />
              </View>
              <View style={styles.storeCardInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeDescription}>{store.description}</Text>
              </View>
            </View>

            <View style={styles.storeDetails}>
              <View style={styles.storeDetailRow}>
                <FontAwesome5 name="map-marker-alt" size={12} color="#5F5E5F" />
                <Text style={styles.storeDetailTextSmall}>{store.address}</Text>
              </View>
              <View style={styles.storeDetailRow}>
                <FontAwesome5 name="phone" size={12} color="#5F5E5F" />
                <Text style={styles.storeDetailTextSmall}>{store.phone}</Text>
              </View>
              <View style={styles.storeDetailRow}>
                <FontAwesome5 name="clock" size={12} color="#5F5E5F" />
                <Text style={styles.storeDetailTextSmall}>{store.hours}</Text>
              </View>
            </View>

            <Pressable
              style={styles.storeCardButton}
              onPress={() => handleGetDirections(store)}
            >
              <FontAwesome5 name="directions" size={14} color="#4A0404" />
              <Text style={styles.storeCardButtonText}>Directions</Text>
            </Pressable>
          </Pressable>
        ))}
      </View>

      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need Help?</Text>
        <Text style={styles.contactText}>
          Can't find what you're looking for? Contact our customer service team.
        </Text>
        <View style={styles.contactButtons}>
          <Pressable style={styles.contactButton}>
            <FontAwesome5 name="phone" size={16} color="#4A0404" />
            <Text style={styles.contactButtonText}>Call Us</Text>
          </Pressable>
          <Pressable style={styles.contactButton}>
            <FontAwesome5 name="envelope" size={16} color="#4A0404" />
            <Text style={styles.contactButtonText}>Email Us</Text>
          </Pressable>
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
  mapSection: {
    padding: 16,
  },
  selectedStoreCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A0404',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedStoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A0404',
    marginBottom: 12,
  },
  storeDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeDetailText: {
    fontSize: 14,
    color: '#1B1C1C',
    marginLeft: 12,
    flex: 1,
  },
  storeDetailTextSmall: {
    fontSize: 12,
    color: '#5F5E5F',
    marginLeft: 8,
    flex: 1,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A0404',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  storeList: {
    padding: 16,
  },
  storeListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B1C1C',
    marginBottom: 16,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  storeCardSelected: {
    borderColor: '#4A0404',
    borderWidth: 2,
  },
  storeCardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeCardInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1C1C',
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 13,
    color: '#5F5E5F',
  },
  storeDetails: {
    marginBottom: 12,
  },
  storeCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  storeCardButtonText: {
    color: '#4A0404',
    fontSize: 14,
    fontWeight: '600',
  },
  contactSection: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B1C1C',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#5F5E5F',
    textAlign: 'center',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: '#4A0404',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StoreLocator;
