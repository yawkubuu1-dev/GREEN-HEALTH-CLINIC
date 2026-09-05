import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  Image as RNImage,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { supabase } from '../lib/supabase';

/**
 * HomeHero - Homepage hero section (single static image)
 * COMPLETELY INDEPENDENT from Shop page Hero Slider
 * Fetches content from home_hero table (NOT hero_slides/hero_settings)
 * Single image only - no rotation, no videos, no cycles
 */
export default function HomeHero({ isPhone = false, onNavigate }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(21 / 9); // Default wide banner

  // Entrance animations
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1.1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;

  const DEFAULT_ASPECT_RATIO = 21 / 9;

  // Frosted glass blur band configuration
  const BLUR_BAND_HEIGHT = isPhone ? 200 : 220; // Height in pixels to fit heading, subtitle, and button
  const BLUR_INTENSITY = 40; // Blur strength for native (adjustable)
  const BLUR_BG_COLOR = 'rgba(0, 0, 0, 0.25)'; // Semi-transparent background

  // Fetch homepage hero content from Supabase
  useEffect(() => {
    const fetchHomeHero = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('home_hero')
          .select('*')
          .eq('id', 1)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        setContent(data);
        console.log('🏠 Homepage hero loaded:', data);

        // Preload image dimensions on native
        if (Platform.OS !== 'web' && data?.image_url) {
          RNImage.getSize(
            data.image_url,
            (width, height) => {
              const ratio = width / height;
              setAspectRatio(ratio);
              console.log(`📐 Homepage hero aspect ratio:`, ratio, `(${width}x${height})`);
            },
            (err) => console.warn('Failed to get image size:', err)
          );
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Failed to load homepage hero:', error);
        setLoadError(error.message);
        setLoading(false);
      }
    };

    fetchHomeHero();
  }, []);

  // Trigger entrance animation when content loads
  useEffect(() => {
    if (content && !loading) {
      // Image animation: fade in + scale down
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Text animation: fade in + slide up (delayed)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(textTranslateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      }, 300);
    }
  }, [content, loading]);

  const handleImageLoad = (naturalWidth, naturalHeight) => {
    const ratio = naturalWidth / naturalHeight;
    setAspectRatio(ratio);
    console.log(`📐 Homepage hero aspect ratio:`, ratio, `(${naturalWidth}x${naturalHeight})`);
  };

  const handleButtonPress = (link) => {
    if (!link) return;
    
    // Handle internal navigation (page names like 'shop', 'services', etc.)
    if (onNavigate && !link.startsWith('http')) {
      // Remove leading slash if present
      const page = link.replace(/^\//, '');
      onNavigate(page);
      return;
    }
    
    // Handle external links
    if (link.startsWith('http')) {
      if (Platform.OS === 'web') {
        window.open(link, '_blank');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { aspectRatio: DEFAULT_ASPECT_RATIO }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (loadError) {
    return (
      <View style={[styles.container, { aspectRatio: DEFAULT_ASPECT_RATIO }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to load homepage hero</Text>
          <Text style={styles.errorMessage}>{loadError}</Text>
        </View>
      </View>
    );
  }

  // No content state
  if (!content) {
    return (
      <View style={[styles.container, { aspectRatio: DEFAULT_ASPECT_RATIO }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No hero content</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { aspectRatio }]}>
      {/* Background Image */}
      {imageError ? (
        <View style={styles.imageErrorContainer}>
          <Text style={styles.imageErrorText}>Image failed to load</Text>
          <Text style={styles.imageErrorUrl} numberOfLines={2}>
            {content.image_url}
          </Text>
        </View>
      ) : Platform.OS === 'web' ? (
        // Native img on web for aspect ratio detection
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          {React.createElement('img', {
            src: content.image_url,
            alt: content.title || 'Homepage hero',
            onLoad: (e) => handleImageLoad(e.target.naturalWidth, e.target.naturalHeight),
            onError: () => setImageError(true),
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            },
          })}
        </Animated.View>
      ) : (
        // React Native Image on native
        <Animated.Image
          source={{ uri: content.image_url }}
          style={[
            styles.image,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            },
          ]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      )}

      {/* Dark Overlay */}
      <View
        style={[
          styles.overlay,
          { backgroundColor: `rgba(0, 0, 0, ${content.overlay_opacity || 0.3})` },
        ]}
      />

      {/* Frosted Glass Blur Band (Glassmorphism) - Bottom positioned */}
      {Platform.OS === 'web' ? (
        // Web: CSS backdrop-filter
        <Animated.View
          style={[
            styles.blurBand,
            {
              bottom: 0,
              height: BLUR_BAND_HEIGHT,
              opacity: textOpacity,
            },
          ]}
        >
          <View style={styles.blurBandWeb}>
            {content.title && (
              <Text style={[styles.titleInBand, isPhone && styles.titleInBandPhone]}>
                {content.title.split(' ').map((word, index, arr) => {
                  // Make "CLINIC" blue, everything else green (K.E, GREEN, HEALTH)
                  const upperWord = word.toUpperCase();
                  let color = '#008000'; // Default green
                  if (upperWord.includes('CLINIC')) color = '#18477a'; // Blue for CLINIC
                  
                  return (
                    <Text key={index} style={{ color }}>
                      {word}{index < arr.length - 1 ? ' ' : ''}
                    </Text>
                  );
                })}
              </Text>
            )}

            {content.subtitle && (
              <Text style={[styles.subtitleInBand, isPhone && styles.subtitleInBandPhone]}>
                {content.subtitle}
              </Text>
            )}

            {/* CTA Buttons inside blur band */}
            <View style={styles.buttonsContainer}>
              {content.primary_button_text && (
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                    isPhone && styles.primaryButtonPhone,
                  ]}
                  onPress={() => handleButtonPress(content.primary_button_link)}
                >
                  <Text style={[styles.primaryButtonText, isPhone && styles.primaryButtonTextPhone]}>
                    {content.primary_button_text}
                  </Text>
                </Pressable>
              )}

              {content.secondary_button_text && (
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                    isPhone && styles.secondaryButtonPhone,
                  ]}
                  onPress={() => handleButtonPress(content.secondary_button_link)}
                >
                  <Text style={[styles.secondaryButtonText, isPhone && styles.secondaryButtonTextPhone]}>
                    {content.secondary_button_text}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>
      ) : (
        // Native: BlurView component
        <Animated.View
          style={[
            styles.blurBand,
            {
              bottom: 0,
              height: BLUR_BAND_HEIGHT,
              opacity: textOpacity,
            },
          ]}
        >
          <BlurView
            intensity={BLUR_INTENSITY}
            tint="dark"
            style={styles.blurViewNative}
          >
            {content.title && (
              <Text style={[styles.titleInBand, isPhone && styles.titleInBandPhone]}>
                {content.title.split(' ').map((word, index, arr) => {
                  // Make "CLINIC" blue, everything else green (K.E, GREEN, HEALTH)
                  const upperWord = word.toUpperCase();
                  let color = '#008000'; // Default green
                  if (upperWord.includes('CLINIC')) color = '#18477a'; // Blue for CLINIC
                  
                  return (
                    <Text key={index} style={{ color }}>
                      {word}{index < arr.length - 1 ? ' ' : ''}
                    </Text>
                  );
                })}
              </Text>
            )}

            {content.subtitle && (
              <Text style={[styles.subtitleInBand, isPhone && styles.subtitleInBandPhone]}>
                {content.subtitle}
              </Text>
            )}

            {/* CTA Buttons inside blur band */}
            <View style={styles.buttonsContainer}>
              {content.primary_button_text && (
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                    isPhone && styles.primaryButtonPhone,
                  ]}
                  onPress={() => handleButtonPress(content.primary_button_link)}
                >
                  <Text style={[styles.primaryButtonText, isPhone && styles.primaryButtonTextPhone]}>
                    {content.primary_button_text}
                  </Text>
                </Pressable>
              )}

              {content.secondary_button_text && (
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.secondaryButtonPressed,
                    isPhone && styles.secondaryButtonPhone,
                  ]}
                  onPress={() => handleButtonPress(content.secondary_button_link)}
                >
                  <Text style={[styles.secondaryButtonText, isPhone && styles.secondaryButtonTextPhone]}>
                    {content.secondary_button_text}
                  </Text>
                </Pressable>
              )}
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    margin: 16,
    backgroundColor: '#1b1b1b',
    overflow: 'hidden',
    borderRadius: 8,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  imageErrorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 20,
  },
  imageErrorText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  imageErrorUrl: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    zIndex: 1,
  },
  contentPhone: {
    padding: 16,
    paddingBottom: 32,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#296416',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 6,
  },
  primaryButtonPressed: {
    backgroundColor: '#1e5010',
  },
  primaryButtonPhone: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  primaryButtonTextPhone: {
    fontSize: 12,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  secondaryButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  secondaryButtonPhone: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  secondaryButtonTextPhone: {
    fontSize: 12,
  },
  // Frosted glass blur band (glassmorphism effect)
  blurBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  blurBandWeb: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)', // Safari support
    }),
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  blurViewNative: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  titleInBand: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 48,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleInBandPhone: {
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 6,
  },
  subtitleInBand: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleInBandPhone: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  secondaryButtonPhone: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  secondaryButtonTextPhone: {
    fontSize: 12,
  },
});
