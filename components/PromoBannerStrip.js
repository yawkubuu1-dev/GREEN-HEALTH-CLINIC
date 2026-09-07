import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { supabase } from '../lib/supabase';

const FALLBACK_BANNERS = [
  {
    id: 'f1',
    title: 'Luxury Autumn Collection',
    subtitle: 'Luxury footwear for every occasion',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539e0cf6d?auto=format&fit=crop&w=900&q=80',
    promo_label: 'HOT DEAL',
    label_color: '#F59E0B',
  },
  {
    id: 'f2',
    title: 'Premium Sneaker Sale',
    subtitle: 'Up to 30% off selected styles this week',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    promo_label: 'SALE 30%',
    label_color: '#EF4444',
  },
  {
    id: 'f3',
    title: 'New Season Arrivals',
    subtitle: 'Fresh designs from Nike, Adidas & more',
    image_url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9ff?auto=format&fit=crop&w=900&q=80',
    promo_label: 'NEW',
    label_color: '#10B981',
  },
];

export default function PromoBannerStrip({ onBannerPress }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  
  // Detect phone vs desktop/tablet
  const isPhone = width < 768;
  
  // Calculate card width to fill the row with equal spacing
  const numCards = 3; // Number of cards visible at once
  const horizontalPadding = 32; // 16px on each side
  const cardGap = 12; // Gap between cards
  const totalGaps = (numCards - 1) * cardGap;
  const cardWidth = (width - horizontalPadding - totalGaps) / numCards;
  
  // Reduced height for phone
  const cardHeight = isPhone ? 160 : 220;

  useEffect(() => {
    fetchPromoBanners();
  }, []);

  const fetchPromoBanners = async () => {
    try {
      // Fetch ALL rows — no is_active filter
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .order('display_position', { ascending: true });

      if (error) throw error;
      setBanners(data && data.length > 0 ? data : FALLBACK_BANNERS);
      console.log('[PromoBanners] Loaded', data?.length || 0, 'banners from database');
    } catch (error) {
      console.warn('[PromoBanners] Using fallback data:', error.message);
      setBanners(FALLBACK_BANNERS);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={[styles.skeletonCard, { width: cardWidth, height: cardHeight }]} />
        <View style={[styles.skeletonCard, { width: cardWidth, height: cardHeight }]} />
        <View style={[styles.skeletonCard, { width: cardWidth, height: cardHeight }]} />
      </View>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        centerContent={banners.length <= 3}
      >
        {banners.map((banner) => (
          <Pressable
            key={banner.id}
            style={[styles.bannerCard, { width: cardWidth, height: cardHeight }]}
            onPress={() => onBannerPress?.(banner)}
            accessibilityRole="button"
            accessibilityLabel={`${banner.promo_label}: ${banner.title}`}
          >
            {/* Background Image */}
            <Image
              source={{ uri: banner.image_url }}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            {/* Dark Overlay */}
            <View style={styles.overlay} />

            {/* Promo Label Badge (Top-Left) */}
            <View
              style={[
                styles.promoBadge,
                { backgroundColor: banner.label_color || '#FF6B6B' },
              ]}
            >
              <Text style={styles.promoBadgeText}>{banner.promo_label || 'PROMO'}</Text>
            </View>

            {/* Text Content */}
            <View style={styles.textContent}>
              <Text style={[styles.bannerTitle, isPhone && styles.bannerTitlePhone]} numberOfLines={2}>
                {banner.title}
              </Text>
              {banner.subtitle && (
                <Text style={[styles.bannerSubtitle, isPhone && styles.bannerSubtitlePhone]} numberOfLines={2}>
                  {banner.subtitle}
                </Text>
              )}
              {banner.discount_percentage > 0 && (
                <Text style={[styles.discountText, isPhone && styles.discountTextPhone]}>
                  {banner.discount_percentage}% OFF
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 16,
    justifyContent: 'center',
  },
  skeletonCard: {
    // width and height are set dynamically via inline style
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bannerCard: {
    // width and height are set dynamically via inline style
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1B1C1C',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  promoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  bannerTitlePhone: {
    fontSize: 13,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
    marginBottom: 4,
  },
  bannerSubtitlePhone: {
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 2,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    marginTop: 4,
  },
  discountTextPhone: {
    fontSize: 12,
    marginTop: 2,
  },
});
