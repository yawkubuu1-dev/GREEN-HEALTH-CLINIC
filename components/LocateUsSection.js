import { FontAwesome5 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import MapComponent from './MapComponent';

const GHANA_OFFICE = {
  id: 'ghana-roman-ridge',
  name: 'Accra Office',
  address: 'Roman Ridge, Accra, Ghana',
  lat: 5.6027166,
  lng: -0.2004655,
};

function toStore(row) {
  const lat = Number(row.latitude ?? row.lat);
  const lng = Number(row.longitude ?? row.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: row.id,
    name: row.name || 'Store',
    address: row.address || '',
    lat,
    lng,
  };
}

function mapsEmbedUrl(store) {
  return `https://maps.google.com/maps?q=${store.lat},${store.lng}&z=16&output=embed`;
}

function deviceMapsUrl(store) {
  const label = encodeURIComponent(store.name || store.address || 'Store');
  if (Platform.OS === 'ios') {
    return `maps:0,0?q=${label}@${store.lat},${store.lng}`;
  }
  if (Platform.OS === 'android') {
    return `geo:${store.lat},${store.lng}?q=${store.lat},${store.lng}(${label})`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`;
}

async function openInDeviceMaps(store) {
  const preferred = deviceMapsUrl(store);
  const webFallback = `https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`;
  try {
    const canOpen = await Linking.canOpenURL(preferred);
    await Linking.openURL(canOpen ? preferred : webFallback);
  } catch {
    await Linking.openURL(webFallback);
  }
}

function GoogleMapEmbed({ store }) {
  if (Platform.OS === 'web') {
    return (
      <iframe
        title={store.name}
        src={mapsEmbedUrl(store)}
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
      center={[store.lat, store.lng]}
      zoom={16}
      markers={[
        {
          lat: store.lat,
          lng: store.lng,
          title: store.name,
          description: store.address,
        },
      ]}
      showStoreLocations={false}
      height={220}
    />
  );
}

function LocationCard({ store, isNarrowCard, textColor, mutedColor, surfaceColor, borderColor }) {
  return (
    <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={[styles.cardInner, isNarrowCard && styles.cardInnerStacked]}>
        <View style={[styles.illustrationCol, isNarrowCard && styles.illustrationColStacked]}>
          <FontAwesome5 name="map-marker-alt" size={28} color="#E53935" solid />
          <Image
            source={require('../assets/isometric-city.png')}
            style={[styles.cityImage, isNarrowCard && styles.cityImageCompact]}
            resizeMode="contain"
            accessibilityLabel={`${store.name} city illustration`}
          />
          <Text style={[styles.officeName, { color: textColor }]}>{store.name}</Text>
          <Text style={[styles.officeAddress, { color: mutedColor }]}>{store.address}</Text>
        </View>

        <View style={[styles.mapCol, isNarrowCard && styles.mapColStacked]}>
          <GoogleMapEmbed store={store} />
          <Pressable
            style={styles.openMapsBtn}
            onPress={() => openInDeviceMaps(store)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${store.name} in Maps`}
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
  const isTablet = width >= 768 && width < 980;
  const twoColumns = width >= 980;
  const isNarrowCard = width < 900;

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const textColor = isDarkMode ? '#F2F2F2' : '#1B1C1C';
  const mutedColor = isDarkMode ? '#A8B39A' : '#477d2d';
  const surfaceColor = isDarkMode ? '#1F241C' : '#FFFFFF';
  const borderColor = isDarkMode ? '#333' : '#d2d5c9';

  useEffect(() => {
    let cancelled = false;

    async function loadStores() {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, address, latitude, longitude')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (cancelled) return;

      if (error) {
        console.warn('Stores query failed, using Ghana office fallback:', error.message);
        setStores([GHANA_OFFICE]);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map(toStore).filter(Boolean);
      setStores(mapped.length ? mapped : [GHANA_OFFICE]);
      setLoading(false);
    }

    loadStores();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: textColor, fontSize: isPhone ? 24 : isTablet ? 28 : 32 }]}>Locate Us</Text>
      <Text style={[styles.subheading, { color: mutedColor, fontSize: isPhone ? 14 : 16 }]}>
        Visit any of our stores. Each map is centered on the exact coordinates.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={mutedColor} style={styles.loader} />
      ) : (
        <View style={[styles.grid, twoColumns && styles.gridTwoCol, isPhone && styles.gridPhone]}>
          {stores.map((store) => (
            <View
              key={String(store.id)}
              style={[
                styles.gridItem,
                twoColumns && styles.gridItemHalf,
                isTablet && styles.gridItemTablet,
              ]}
            >
              <LocationCard
                store={store}
                isNarrowCard={isNarrowCard}
                textColor={textColor}
                mutedColor={mutedColor}
                surfaceColor={surfaceColor}
                borderColor={borderColor}
              />
            </View>
          ))}
        </View>
      )}
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
    paddingHorizontal: 0,
    overflow: 'hidden',
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
    paddingHorizontal: 8,
  },
  loader: {
    marginVertical: 40,
  },
  grid: {
    flexDirection: 'column',
    gap: 20,
    width: '100%',
  },
  gridTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 20,
  },
  gridPhone: {
    flexDirection: 'column',
  },
  gridItem: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  gridItemTablet: {
    width: '100%',
  },
  gridItemHalf: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 360,
    minWidth: 0,
    maxWidth: '100%',
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: '100%',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 16,
    width: '100%',
    minWidth: 0,
  },
  cardInnerStacked: {
    flexDirection: 'column',
  },
  illustrationCol: {
    width: 180,
    maxWidth: '100%',
    flexShrink: 0,
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
    maxWidth: '100%',
  },
  cityImageCompact: {
    width: 110,
    height: 110,
  },
  officeName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  officeAddress: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    flexShrink: 1,
  },
  mapCol: {
    flex: 1,
    height: 240,
    minHeight: 220,
    minWidth: 0,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e8ece4',
  },
  mapColStacked: {
    minHeight: 220,
    width: '100%',
    height: 240,
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
