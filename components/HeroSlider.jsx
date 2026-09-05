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
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

/**
 * HeroSlider - Fully Supabase-controlled hero carousel
 * Fetches slides and settings from Supabase, supports images and videos,
 * per-slide duration/autoplay, global cycle limits, and CTA buttons
 */
export default function HeroSlider({ height = 510, isPhone = false }) {
  const [slides, setSlides] = useState([]);
  const [settings, setSettings] = useState(null);
  const [idx, setIdx] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  const total = slides.length;

  // Fetch slides and settings from Supabase on mount
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);
        
        // Fetch active slides ordered by position
        const { data: slidesData, error: slidesError } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('position', { ascending: true });

        if (slidesError) throw slidesError;

        // Fetch global settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('hero_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (settingsError) throw settingsError;

        setSlides(slidesData || []);
        setSettings(settingsData);
        setLoading(false);
        
        console.log('🎬 Hero slides loaded:', slidesData?.length || 0);
        console.log('⚙️ Hero settings:', settingsData);
      } catch (error) {
        console.error('❌ Failed to load hero data:', error);
        setLoadError(error.message);
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  // Get settings values with fallbacks
  const getTransitionDuration = () => settings?.transition_duration_ms || 400;
  const getSlideDuration = (slide) => slide.duration_ms || settings?.default_duration_ms || 5000;
  const getMaxCycles = () => settings?.loop_infinite ? 0 : (settings?.max_cycles || 3);

  // Animation function
  const advance = (nextIdx) => {
    const duration = getTransitionDuration();
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      setIdx(nextIdx);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
  };

  // Navigation controls
  const goNext = () => {
    clearTimer();
    const next = (idx + 1) % total;
    const newCycles = next === 0 ? cycles + 1 : cycles;
    const maxCycles = getMaxCycles();
    
    if (maxCycles > 0 && next === 0 && newCycles >= maxCycles) {
      advance(total - 1);
      setStopped(true);
      setCycles(newCycles);
      return;
    }
    
    setCycles(newCycles);
    advance(next);
  };

  const goPrev = () => {
    clearTimer();
    advance((idx - 1 + total) % total);
  };

  const goTo = (i) => {
    clearTimer();
    advance(i);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Auto-advance timer
  useEffect(() => {
    if (!slides.length || !settings || stopped) return;
    
    const slide = slides[idx];
    
    // Skip auto-advance if autoplay is disabled for this slide
    if (slide.autoplay === false) {
      return () => clearTimer();
    }

    const duration = getSlideDuration(slide);
    timerRef.current = setTimeout(() => {
      const next = (idx + 1) % total;
      const newCycles = next === 0 ? cycles + 1 : cycles;
      const maxCycles = getMaxCycles();
      
      if (maxCycles > 0 && next === 0 && newCycles >= maxCycles) {
        advance(total - 1);
        setStopped(true);
        setCycles(newCycles);
        return;
      }
      
      setCycles(newCycles);
      advance(next);
    }, duration);

    return () => clearTimer();
  }, [idx, stopped, slides, settings, cycles]);

  // Error handling
  const handleMediaError = (slideId) => {
    setImageErrors(prev => ({ ...prev, [slideId]: true }));
  };

  const handleCTAPress = (link) => {
    if (!link) return;
    
    if (link.startsWith('http')) {
      if (Platform.OS === 'web') {
        window.open(link, '_blank');
      }
    } else {
      // Internal navigation could be handled here
      console.log('Navigate to:', link);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading slides...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (loadError) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-circle" size={32} color="#d32f2f" />
          <Text style={styles.errorTitle}>Failed to load hero slider</Text>
          <Text style={styles.errorMessage}>{loadError}</Text>
        </View>
      </View>
    );
  }

  // No slides state
  if (!slides.length) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No active slides</Text>
        </View>
      </View>
    );
  }

  const slide = slides[idx];
  const hasError = imageErrors[slide.id];

  return (
    <View style={[styles.container, { height }]}>
      {/* Slides layer with fade animation */}
      <Animated.View style={[styles.slideContainer, { opacity: fadeAnim }]}>
        {hasError ? (
          // Error fallback
          <View style={styles.mediaErrorContainer}>
            <FontAwesome name="exclamation-triangle" size={32} color="#d32f2f" />
            <Text style={styles.mediaErrorTitle}>Image failed to load</Text>
            <Text style={styles.mediaErrorUrl} numberOfLines={2}>
              {slide.url}
            </Text>
          </View>
        ) : slide.type === 'video' && Platform.OS === 'web' ? (
          // Video on web (HTML5)
          <View style={StyleSheet.absoluteFill}>
            {React.createElement('video', {
              key: slide.id,
              src: slide.url,
              autoPlay: true,
              muted: true,
              loop: true,
              playsInline: true,
              onError: () => handleMediaError(slide.id),
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              },
            })}
          </View>
        ) : Platform.OS === 'web' ? (
          // Image on web (native HTML img for better performance)
          <View style={StyleSheet.absoluteFill}>
            {React.createElement('img', {
              key: slide.id,
              src: slide.url,
              alt: slide.caption || 'Hero slide',
              onError: () => handleMediaError(slide.id),
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              },
            })}
          </View>
        ) : (
          // Image on native (React Native Image)
          <RNImage
            source={{ uri: slide.url }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => handleMediaError(slide.id)}
          />
        )}
      </Animated.View>

      {/* Text and CTA overlay */}
      <View style={[styles.contentOverlay, isPhone && styles.contentOverlayPhone]}>
        {slide.brand_text && (
          <Text style={styles.brandText}>{slide.brand_text}</Text>
        )}
        {slide.caption && (
          <Text style={[styles.caption, isPhone && styles.captionPhone]}>
            {slide.caption}
          </Text>
        )}
        
        <View style={styles.ctaContainer}>
          {slide.cta_primary_text && (
            <Pressable
              onPress={() => handleCTAPress(slide.cta_primary_link)}
              style={({ pressed }) => [
                styles.ctaPrimary,
                pressed && styles.ctaPrimaryPressed,
              ]}
            >
              <Text style={styles.ctaPrimaryText}>{slide.cta_primary_text}</Text>
            </Pressable>
          )}
          {slide.cta_secondary_text && (
            <Pressable
              onPress={() => handleCTAPress(slide.cta_secondary_link)}
              style={({ pressed }) => [
                styles.ctaSecondary,
                pressed && styles.ctaSecondaryPressed,
              ]}
            >
              <Text style={styles.ctaSecondaryText}>{slide.cta_secondary_text}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Navigation arrows */}
      <Pressable
        onPress={goPrev}
        style={styles.arrowLeft}
        accessibilityRole="button"
        accessibilityLabel="Previous slide"
      >
        <FontAwesome name="chevron-left" size={14} color="#fff" />
      </Pressable>
      
      <Pressable
        onPress={goNext}
        style={styles.arrowRight}
        accessibilityRole="button"
        accessibilityLabel="Next slide"
      >
        <FontAwesome name="chevron-right" size={14} color="#fff" />
      </Pressable>

      {/* Pagination dots */}
      <View style={styles.dotsContainer}>
        {slides.map((s, i) => (
          <Pressable
            key={s.id}
            onPress={() => goTo(i)}
            accessibilityRole="button"
            accessibilityLabel={`Go to slide ${i + 1}`}
          >
            <View
              style={[
                styles.dot,
                i === idx ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </Pressable>
        ))}
      </View>

      {/* Video badge */}
      {slide.type === 'video' && (
        <View style={styles.videoBadge}>
          <FontAwesome name="play-circle" size={12} color="#fff" />
          <Text style={styles.videoBadgeText}>VIDEO</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    backgroundColor: '#1b1b1b',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderRadius: 8,
  },
  slideContainer: {
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
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  mediaErrorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 20,
  },
  mediaErrorTitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  mediaErrorUrl: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  contentOverlay: {
    padding: 20,
    zIndex: 2,
  },
  contentOverlayPhone: {
    padding: 16,
  },
  brandText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  caption: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    fontFamily: 'Georgia',
    lineHeight: 42,
    marginBottom: 20,
  },
  captionPhone: {
    fontSize: 22,
    lineHeight: 28,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ctaPrimary: {
    backgroundColor: '#296416',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  ctaPrimaryPressed: {
    backgroundColor: '#1e5010',
  },
  ctaPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  ctaSecondary: {
    borderWidth: 1.5,
    borderColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  ctaSecondaryPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  ctaSecondaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  arrowLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  arrowRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  videoBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
  },
  videoBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
