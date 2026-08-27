import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';

/**
 * MapComponent - Leaflet Map Integration for Prolyn Wear
 * 
 * This component integrates Leaflet maps for web platform.
 * For native platforms, it shows a placeholder with instructions.
 * 
 * Props:
 * - center: [latitude, longitude] - default is Accra, Ghana [5.6037, -0.1870]
 * - zoom: number - default zoom level (13)
 * - markers: array of {lat, lng, title, description} - markers to display
 * - onMarkerClick: function - callback when marker is clicked
 * - height: number or string - map container height (default: 400)
 * - showStoreLocations: boolean - whether to show Prolyn Wear store locations
 */

const MapComponent = ({
  center = [5.6037, -0.1870], // Accra, Ghana
  zoom = 13,
  markers = [],
  onMarkerClick,
  height = 400,
  showStoreLocations = true,
}) => {
  const [MapContainer, setMapContainer] = useState(null);
  const [TileLayer, setTileLayer] = useState(null);
  const [Marker, setMarker] = useState(null);
  const [Popup, setPopup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default store locations for Prolyn Wear
  const defaultStoreLocations = [
    {
      lat: 5.6037,
      lng: -0.1870,
      title: 'Prolyn Wear Main Store',
      description: 'Visit our flagship store in Accra',
    },
    {
      lat: 5.5560,
      lng: -0.1969,
      title: 'Prolyn Wear Osu Branch',
      description: 'Find us in Osu for premium footwear',
    },
  ];

  const allMarkers = showStoreLocations
    ? [...defaultStoreLocations, ...markers]
    : markers;

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Dynamically import Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);

      // Dynamically import react-leaflet components
      import('react-leaflet')
        .then((module) => {
          setMapContainer(() => module.MapContainer);
          setTileLayer(() => module.TileLayer);
          setMarker(() => module.Marker);
          setPopup(() => module.Popup);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error loading map components:', error);
          setIsLoading(false);
        });

      return () => {
        // Cleanup
        const leafletLinks = document.querySelectorAll('link[href*="leaflet"]');
        leafletLinks.forEach((link) => link.remove());
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  // For native platforms (iOS/Android), show a message
  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.nativeMessage}>
          <Text style={styles.nativeTitle}>Map View</Text>
          <Text style={styles.nativeText}>
            Interactive maps are available on the web version of Prolyn Wear.
          </Text>
          <Text style={styles.nativeText}>
            Visit our stores at:
          </Text>
          {defaultStoreLocations.map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <Text style={styles.locationTitle}>{location.title}</Text>
              <Text style={styles.locationDesc}>{location.description}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color="#4A0404" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Error state (if components didn't load)
  if (!MapContainer || !TileLayer || !Marker || !Popup) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.errorText}>Unable to load map</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allMarkers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.lat, marker.lng]}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(marker);
                }
              },
            }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#4A0404' }}>
                  {marker.title}
                </h3>
                <p style={{ margin: 0, color: '#5F5E5F' }}>
                  {marker.description}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FAF9F9',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeMessage: {
    padding: 20,
    alignItems: 'center',
  },
  nativeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A0404',
    marginBottom: 12,
  },
  nativeText: {
    fontSize: 16,
    color: '#5F5E5F',
    textAlign: 'center',
    marginBottom: 8,
  },
  locationItem: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#4A0404',
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B1C1C',
    marginBottom: 4,
  },
  locationDesc: {
    fontSize: 14,
    color: '#5F5E5F',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#5F5E5F',
  },
  errorText: {
    fontSize: 16,
    color: '#D26A5F',
  },
});

export default MapComponent;
