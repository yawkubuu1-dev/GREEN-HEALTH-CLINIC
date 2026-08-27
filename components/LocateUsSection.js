import { FontAwesome5 } from '@expo/vector-icons';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import MapComponent from './MapComponent';

// Add another office by appending an object with the same shape.
// The 2-column grid layout does not need to change.
const OFFICE_LOCATIONS = [
  {
    id: 'ghana-madina',
    name: 'Accra Office',
    city: 'Madina, Ghana',
    address:
      'Madina Estate Road to Social Welfare, Behind the Goil Filling Station, Madina, Accra, Ghana',
    lat: 5.6897,
    lng: -0.1679,
  },
  {
    id: 'us-new-york',
    name: 'New York Office',
    city: 'New York, USA',
    address: '245 West 29th Street, Suite 302, New York, NY 10001, United States',
    lat: 40.7479,
    lng: -73.9937,
  },
];

function mapsQuery(office) {
  return encodeURIComponent(office.address || `${office.lat},${office.lng}`);
}

function mapsSearchUrl(office) {
  return `https://www.google.com/maps/search/?api=1&query=${mapsQuery(office)}`;
}

function mapsEmbedUrl(office) {
  return `https://maps.google.com/maps?q=${mapsQuery(office)}&z=16&output=embed`;
}

function GoogleMapEmbed({ office }) {
  if (Platform.OS === 'web') {
    return (
      <iframe
        title={office.name}
        src={mapsEmbedUrl(office)}
        width="100%"
        height="100%"
        style={{ border: 0, width: '100%', height: '100%' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  }

  return (
    <MapComponent
      center={[office.lat, office.lng]}
      zoom={16}
      markers={[
        {
          lat: office.lat,
          lng: office.lng,
          title: office.name,
          description: office.address,
        },
      ]}
      showStoreLocations={false}
      height={220}
    />
  );
}

function LocationCard({ office, isNarrowCard, textColor, mutedColor, surfaceColor, borderColor }) {
  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={[styles.cardInner, isNarrowCard && styles.cardInnerStacked]}>
        <View style={[styles.illustrationCol, isNarrowCard && styles.illustrationColStacked]}>
          <FontAwesome5 name="map-marker-alt" size={28} color="#E53935" solid />
          <Image
            source={require('../assets/isometric-city.png')}
            style={styles.cityImage}
            resizeMode="contain"
            accessibilityLabel={`${office.name} city illustration`}
          />
          <Text style={[styles.officeName, { color: textColor }]}>{office.name}</Text>
          <Text style={[styles.officeCity, { color: mutedColor }]}>{office.city}</Text>
          <Text style={[styles.officeAddress, { color: mutedColor }]}>{office.address}</Text>
        </View>

        <View style={[styles.mapCol, isNarrowCard && styles.mapColStacked]}>
          <GoogleMapEmbed office={office} />
          <Pressable
            style={styles.openMapsBtn}
            onPress={() => Linking.openURL(mapsSearchUrl(office))}
            accessibilityRole="link"
            accessibilityLabel={`Open ${office.name} in Google Maps`}
          >
            <FontAwesome5 name="external-link-alt" size={11} color="#1B1C1C" />
            <Text style={styles.openMapsText}>Open in Maps</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function LocateUsSection({ isDarkMode = false }) {
  const { width } = useWindowDimensions();
  const isPhone = width < 768;
  const twoColumns = width >= 980;

  const textColor = isDarkMode ? '#F2F2F2' : '#1B1C1C';
  const mutedColor = isDarkMode ? '#A8B39A' : '#477d2d';
  const surfaceColor = isDarkMode ? '#1F241C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333' : '#d2d5c9';

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: textColor }]}>Locate Us</Text>
      <Text style={[styles.subheading, { color: mutedColor }]}>
        Visit any of our offices. Each map shows the exact location with a marker.
      </Text>

      <View style={[styles.grid, twoColumns && styles.gridTwoCol, isPhone && styles.gridPhone]}>
        {OFFICE_LOCATIONS.map((office) => (
          <View key={office.id} style={[styles.gridItem, twoColumns && styles.gridItemHalf]}>
            <LocationCard
              office={office}
              isNarrowCard={isPhone}
              textColor={textColor}
              mutedColor={mutedColor}
              surfaceColor={surfaceColor}
              borderColor={borderColor}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'column',
    gap: 20,
  },
  gridTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridPhone: {
    flexDirection: 'column',
  },
  gridItem: {
    width: '100%',
  },
  gridItemHalf: {
    width: '49%',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
  },
  cardInnerStacked: {
    flexDirection: 'column',
  },
  illustrationCol: {
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  illustrationColStacked: {
    width: '100%',
  },
  cityImage: {
    width: 132,
    height: 132,
  },
  officeName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  officeCity: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  officeAddress: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  mapCol: {
    flex: 1,
    height: 240,
    minHeight: 240,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e8ece4',
  },
  mapColStacked: {
    minHeight: 240,
    width: '100%',
  },
  openMapsBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(27,28,28,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  openMapsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B1C1C',
  },
});
