import { StatusBar } from 'expo-status-bar';

import { useEffect, useMemo, useRef, useState } from 'react';

import React from 'react';

import {

  ActivityIndicator,

  Animated,

  Image,

  Modal,

  Pressable,

  SafeAreaView,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  useWindowDimensions,

  View,

  Linking,

  Platform,

  Dimensions,

} from 'react-native';

import { supabase } from './lib/supabase';

import HeroSlider from './components/HeroSlider';
import HomeHero from './components/HomeHero';
import HealthPrioritySection from './components/HealthPrioritySection';
import ConsultationCard from './components/ConsultationCard';
import CarouselComponent from './components/CarouselComponent';

import ProductDetail from './components/ProductDetail';

import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

import SendToDriverButton from './components/SendToDriverButton';
import LocateUsSection from './components/LocateUsSection';
import { Video } from 'expo-av';

import { sendToDriver, formatDeliveryMessage, createWhatsAppLink } from './utils/whatsappHelper';
import { serviceService, aboutService, patientStoryService } from './services/supabaseService';









const palette = {

  background: '#f8f8f6',

  surface: '#FFFFFF',

  charcoal: '#1B1C1C',

  secondary: '#477d2d',

  oxblood: '#296416',

  oxbloodSoft: '#6c954a',

  vault: '#18477a',

  accent: '#547ba4',

  border: '#d2d5c9',

  secondaryBackground: '#e9eae5',

};



const darkPalette = {

  background: '#121212',

  surface: '#1E1E1E',

  charcoal: '#E8EAED',

  secondary: '#6c954a',

  oxblood: '#477d2d',

  oxbloodSoft: '#8ab866',

  vault: '#547ba4',

  accent: '#7aa3cc',

  border: '#333333',

  secondaryBackground: '#252525',

};



// Auto badge color based on tag text — shared by product grid and carousel

const getBadgeColor = (label) => {

  if (!label) return '#4A0404';

  const t = label.toUpperCase();

  if (/NEW|ARRIVAL|FRESH/.test(t))          return '#10B981'; // green

  if (/SALE|OFF|DISCOUNT|PROMO/.test(t))    return '#EF4444'; // red

  if (/HOT|TRENDING|POPULAR|DEAL/.test(t))  return '#F59E0B'; // amber

  if (/BEST|SELLER|TOP|PICK/.test(t))       return '#3B82F6'; // blue

  if (/LUXURY|PREMIUM|DESIGNER/.test(t))    return '#8B5CF6'; // purple

  if (/CLASSIC|ESSENTIAL/.test(t))          return '#6B7280'; // gray

  return '#4A0404';

};



const fallbackChips = [

  'T-Shirts',

  'Jeans',

  'Dresses',

  'Jackets',

  'Hoodies',

  'Shorts',

  'Sweaters',

  'Activewear',

  'Formal Wear',

  'Accessories',

];

const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

const sizeMultipliers = {

  'S': 1,

  'M': 1.1,

  'L': 1.2,

  'XL': 1.3,

  'XXL': 1.4,

};



const fallbackCategoryCards = [

  {

    id: 'tshirts',

    name: 'Classic Cotton T-Shirt',

    price: 30,

    tag: 'Best Seller',

    description: '100% cotton comfortable t-shirt for everyday wear.',

    image:

      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',

  },

  {

    id: 'jeans',

    name: 'Slim Fit Denim Jeans',

    price: 60,

    tag: 'Premium',

    description: 'Modern slim fit jeans with stretch comfort.',

    image:

      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80',

  },

  {

    id: 'dresses',

    name: 'Floral Summer Dress',

    price: 70,

    tag: 'New Arrival',

    description: 'Lightweight floral print dress perfect for summer.',

    image:

      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',

  },

  {

    id: 'jackets',

    name: 'Denim Jacket',

    price: 80,

    tag: 'Classic',

    description: 'Classic denim jacket with vintage wash.',

    image:

      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80',

  },

  {

    id: 'hoodies',

    name: 'Essential Pullover Hoodie',

    price: 50,

    tag: 'Comfort',

    description: 'Classic pullover hoodie with kangaroo pocket.',

    image:

      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80',

  },

];



const DEFAULT_CATEGORY_IMAGE =

  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80';



const LOCAL_API_BASE = 'http://localhost:3001';



const mapCategoryRowToCard = (row) => ({

  id: row.id,

  name: row.name,

  price: Number(row.metadata?.price ?? row.metadata?.base_price ?? 0),

  tag: row.promo_label ?? row.tag ?? row.metadata?.tag ?? row.metadata?.promo_label ?? null,

  description: row.description ?? row.metadata?.description ?? '',

  image: row.url || row.image_url || row.metadata?.image_url || row.metadata?.url || DEFAULT_CATEGORY_IMAGE,

});



const mapProductRowToCard = (row, catNameToImageMap = {}, catIdToNameMap = {}) => {

  let catName = row.category_id ?? row.category ?? row.category_name ?? row.metadata?.category_name ?? row.metadata?.category ?? row.tag ?? null;

  

  // If the category is actually a UUID from the categories table, resolve it to the human-readable name!

  if (catName && catIdToNameMap[catName]) {

    catName = catIdToNameMap[catName];

  }

  

  // Handle products with or without sizes

  const hasSizes = row.has_sizes ?? row.has_weights ?? false;

  const basePrice = Number(row.price ?? 0);

  

  return {

    id: row.id,

    name: row.name ?? row.title ?? 'Untitled product',

    price_s: Number(row.price_s ?? (hasSizes && basePrice ? basePrice : basePrice)),

    price_m: Number(row.price_m ?? (hasSizes && basePrice ? basePrice * 1.1 : basePrice)),

    price_l: Number(row.price_l ?? (hasSizes && basePrice ? basePrice * 1.2 : basePrice)),

    price_xl: Number(row.price_xl ?? (hasSizes && basePrice ? basePrice * 1.3 : basePrice)),

    price_xxl: Number(row.price_xxl ?? (hasSizes && basePrice ? basePrice * 1.4 : basePrice)),

    hasSizes: hasSizes,

    hasWeights: hasSizes, // Keep for backward compatibility

    price: basePrice,

    tag: row.promo_label ?? row.tag ?? row.category_name ?? row.metadata?.tag ?? row.metadata?.promo_label ?? null,

    categoryLabel: catName,

    description: row.description ?? row.details ?? row.metadata?.description ?? '',

    position: row.position ?? 0,

    image:

      row.url || row.image_url || row.image || row.photo_url || row.metadata?.image_url || row.metadata?.url || catNameToImageMap[catName] || DEFAULT_CATEGORY_IMAGE,

    stock_quantity: row.stock_quantity ?? 0,
    product_images: row.product_images || [], // ✅ Add product_images array

    // Medicine-specific fields

    form: row.form ?? null,

    dosage_strength: row.dosage_strength ?? null,

    pack_sizes: row.pack_sizes ?? [],

    requires_prescription: row.requires_prescription ?? false,

    active_ingredient: row.active_ingredient ?? null,

    manufacturer: row.manufacturer ?? null,

    expiry_date: row.expiry_date ?? null,

    storage_info: row.storage_info ?? null,

    side_effects: row.side_effects ?? null,

    contraindications: row.contraindications ?? null,

    is_featured: row.is_featured ?? false,

  };

};



function CategoryCard({ category, cardWidth, currency, onAddToCart, onRemoveFromCart, cartItems = [], onViewDetails, isPhone, isUserDarkMode }) {

  const [selectedWeight, setSelectedWeight] = useState('US 9');

  const [imgSrc, setImgSrc] = useState(DEFAULT_CATEGORY_IMAGE);



  // Pre-validate the image URL — on web, use browser's native Image to detect

  // broken URLs (incl. ones that return HTTP 200 but aren't valid images)

  useEffect(() => {

    const url = category.image;

    if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {

      setImgSrc(DEFAULT_CATEGORY_IMAGE);

      return;

    }

    if (typeof window !== 'undefined' && window.Image) {

      const img = new window.Image();

      img.onload  = () => setImgSrc(url);

      img.onerror = () => setImgSrc(DEFAULT_CATEGORY_IMAGE);

      img.src = url;

    } else {

      setImgSrc(url);

    }

  }, [category.image]);



  const itemPrice = useMemo(() => {

    if (!category.hasSizes && !category.hasWeights) return category.price || 0;

    if (selectedWeight === 'S') return category.price_s || category.price || 0;

    if (selectedWeight === 'M') return category.price_m || category.price || 0;

    if (selectedWeight === 'L') return category.price_l || category.price || 0;

    if (selectedWeight === 'XL') return category.price_xl || category.price || 0;

    if (selectedWeight === 'XXL') return category.price_xxl || category.price || 0;

    return category.price || 0;

  }, [selectedWeight, category]);



  // Check if this item is in the cart with the selected weight

  const isSelected = useMemo(() => {

    if (!cartItems || cartItems.length === 0) return false;

    return cartItems.some(

      (item) => item.id === category.id && item.selectedWeight === (category.hasWeights ? selectedWeight : 'unit')

    );

  }, [cartItems, category.id, selectedWeight, category.hasWeights]);



  const handleToggleCart = () => {

    const weight = category.hasWeights ? selectedWeight : 'unit';

    if (isSelected) {

      // Remove from cart

      onRemoveFromCart(category.id, weight);

    } else {

      // Add to cart

      onAddToCart(category, weight, itemPrice);

    }

  };



  // Compact sizes for real phone 2-column layout (~167px cards)

  const cardPad   = isPhone ? 8  : 14;

  const nameFz    = isPhone ? 14 : 24;

  const nameLineH = isPhone ? 18 : 28;

  const priceFz   = isPhone ? 12 : 20;

  const weightPad = isPhone ? 6  : 10;

  const weightFz  = isPhone ? 10 : 12;

  const btnPad    = isPhone ? 8  : 13;

  const btnFz     = isPhone ? 9  : 12;

  const btnLs     = isPhone ? 0.6 : 1.8;



  return (

    <View style={[styles.productCard, { 

      width: cardWidth,

      backgroundColor: isUserDarkMode ? darkPalette.surface : palette.surface

    }]}>

      <View style={{ padding: cardPad }}>

        <Pressable onPress={() => onViewDetails?.(category)}>

          <View style={[styles.imageWrap, { width: cardWidth - cardPad * 2 }]}>

            <View style={styles.cardImageContainer}>

              <Image

                source={{ uri: imgSrc }}

                resizeMode="contain"

                style={styles.productImage}

                onError={() => setImgSrc(DEFAULT_CATEGORY_IMAGE)}

              />



              {/* Promo / Tag Badge — top-left */}

              {category.tag ? (

                <View style={{

                  position: 'absolute', top: 8, left: 8,

                  backgroundColor: getBadgeColor(category.tag),

                  paddingHorizontal: isPhone ? 6 : 10,

                  paddingVertical: isPhone ? 3 : 4,

                  borderRadius: 4,

                  zIndex: 2,

                }}>

                  <Text style={{

                    color: '#fff',

                    fontSize: isPhone ? 9 : 11,

                    fontWeight: '700',

                    letterSpacing: 0.5,

                  }}>

                    {category.tag.toUpperCase()}

                  </Text>

                </View>

              ) : null}



              {/* Square Cart Icon at bottom-right of image */}

              <Pressable 

                onPress={handleToggleCart}

                style={[

                  styles.cartIconSquare,

                  isSelected && styles.cartIconSquareSelected

                ]}

              >

                <FontAwesome 

                  name="shopping-cart" 

                  size={isPhone ? 20 : 26} 

                  color={isSelected ? '#FFF' : (isUserDarkMode ? darkPalette.oxblood : palette.oxblood)}

                />

              </Pressable>

            </View>

          </View>



          <View style={[styles.rowBetween, { gap: 4 }]}>

            <Text style={[styles.productName, { 

              fontSize: nameFz, 

              lineHeight: nameLineH,

              color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal

            }]} numberOfLines={isPhone ? 2 : undefined}>

              {category.name}

            </Text>

          <Text style={[styles.productPrice, { 

            fontSize: priceFz,

            color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

          }]}>{formatMoney(itemPrice, currency)}</Text>

        </View>

          {/* Medicine-specific info: dosage & form */}

          {(category.dosage_strength || category.form) && (

            <Text style={{ 

              fontSize: isPhone ? 11 : 13,

              color: isUserDarkMode ? darkPalette.secondary : palette.secondary,

              marginTop: 2

            }}>

              {category.dosage_strength}{category.dosage_strength && category.form ? ' • ' : ''}{category.form ? category.form.charAt(0).toUpperCase() + category.form.slice(1) : ''}

            </Text>

          )}

          {/* Prescription requirement badge */}

          {category.requires_prescription && (

            <View style={{

              backgroundColor: '#FFC107',

              paddingHorizontal: isPhone ? 6 : 8,

              paddingVertical: isPhone ? 2 : 3,

              borderRadius: 3,

              alignSelf: 'flex-start',

              marginTop: 4

            }}>

              <Text style={{

                color: '#000',

                fontSize: isPhone ? 9 : 10,

                fontWeight: '700',

                letterSpacing: 0.5

              }}>

                ℞ PRESCRIPTION REQUIRED

              </Text>

            </View>

          )}

          {/* Hide description on phone to save vertical space */}

          {!isPhone && <Text style={[styles.categoryDescription, {

            color: isUserDarkMode ? darkPalette.secondary : palette.secondary

          }]}>{category.description}</Text>}

        </Pressable>

      </View>

    </View>

  );

}



const adminStats = (count) => [

  { label: 'Products', value: String(count), note: 'Live catalog items' },

  { label: 'Orders', value: '18', note: 'Today' },

  { label: 'Low stock', value: '2', note: 'Needs review' },

  { label: 'Revenue', value: '$3.42K', note: 'Week to date' },

];



const adminActions = ['Review orders', 'Publish promo'];

const currencyOptions = ['USD', 'EUR', 'GBP', 'NGN', 'GHC'];

const currencyRates = {

  USD: { symbol: '$', rate: 1 },

  EUR: { symbol: '€', rate: 0.92 },

  GBP: { symbol: '£', rate: 0.78 },

  NGN: { symbol: '₦', rate: 1550 },

  GHC: { symbol: 'GH₵', rate: 15.2 },

};



const formatMoney = (amount, currency = 'GHC') => {

  const config = currencyRates[currency] ?? currencyRates.GHC;

  const ghcRate = currencyRates.GHC?.rate || 15.2;

  const converted = amount * (config.rate / ghcRate);

  return `${config.symbol}${converted.toFixed(2)}`;
};

const fallbackFooterSections = [
  {
    section_key: 'aboutUs',
    title: 'ABOUT Prolyn Wear',
    footer_items: [
      { id: 'f1', label: 'We specialize in the distribution of a wide range of quality products, proudly made in Ghana.', action_type: 'text', sort_order: 10 },
      { id: 'f2', label: 'Whether you\'re a household, restaurant, caterer, retailer, or food service provider, we offer professional support and consistent supply to meet your needs.', action_type: 'text', sort_order: 20 }
    ]
  },
  {
    section_key: 'mainMenu',
    title: 'MAIN MENU',
    footer_items: [
      { id: 'f4', label: 'Home', action_type: 'navigate', action_value: 'shop', sort_order: 10 },
      { id: 'f5', label: 'About Us', action_type: 'alert', action_value: 'About Prolyn Wear coming soon', sort_order: 20 },
      { id: 'f6', label: 'Prolyn Wear Shop', action_type: 'navigate', action_value: 'shop', sort_order: 30 },
      { id: 'f7', label: 'Contact Us', action_type: 'alert', action_value: 'Contact Us coming soon', sort_order: 40 }
    ]
  },
  {
    section_key: 'links',
    title: 'LINKS',
    footer_items: [
      { id: 'f8', label: 'Cart', action_type: 'navigate', action_value: 'cart', sort_order: 10 },
      { id: 'f9', label: 'Checkout', action_type: 'checkout', sort_order: 20 },
      { id: 'f10', label: 'Wishlist', action_type: 'alert', action_value: 'Wishlist coming soon', sort_order: 30 },
      { id: 'f11', label: 'Terms And Conditions', action_type: 'alert', action_value: 'Terms & Conditions coming soon', sort_order: 40 }
    ]
  },
  {
    section_key: 'contact',
    title: 'CONTACT',
    footer_items: [
      { id: 'f12', label: 'Madina Estate Road to Social Welfare, Behind the Goil Filling Station, Madina, Ghana', action_type: 'text', sort_order: 10 },
      { id: 'f13', label: 'For Business, call: +233591008897', action_type: 'link', action_value: 'tel:+233591008897', icon_library: 'FontAwesome', icon_name: 'phone', sort_order: 20 },
      { id: 'f14', label: 'Click here to order on Whatsapp', action_type: 'link', action_value: 'https://wa.me/233591008897', icon_library: 'FontAwesome', icon_name: 'whatsapp', sort_order: 30 },
      { id: 'f15', label: 'Facebook', action_type: 'link', action_value: 'https://facebook.com', icon_library: 'FontAwesome5', icon_name: 'facebook-f', sort_order: 40 },
      { id: 'f16', label: 'Instagram', action_type: 'link', action_value: 'https://instagram.com', icon_library: 'FontAwesome5', icon_name: 'instagram', sort_order: 50 },
      { id: 'f17', label: 'WhatsApp', action_type: 'link', action_value: 'https://wa.me/233591008897', icon_library: 'FontAwesome5', icon_name: 'whatsapp', sort_order: 60 },
      { id: 'f18', label: 'Twitter', action_type: 'link', action_value: 'https://twitter.com', icon_library: 'FontAwesome5', icon_name: 'twitter', sort_order: 70 },
      { id: 'f19', label: 'TikTok', action_type: 'link', action_value: 'https://tiktok.com', icon_library: 'FontAwesome5', icon_name: 'tiktok', sort_order: 80 }
    ]
  }
];

// Animated Social Icon Component
function AnimatedSocialIcon({ onPress, image }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handleMouseEnter = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };
  
  const handleMouseLeave = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
  };
  
  return (
    <Pressable 
      style={styles.socialIcon} 
      onPress={onPress}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Animated.Image 
        source={image} 
        style={[
          styles.socialIconImage,
          { transform: [{ scale: scaleAnim }] }
        ]} 
        resizeMode="contain" 
      />
    </Pressable>
  );
}

// Animated Social Icon Badge Component for Share Menu
function AnimatedSocialIconBadge({ onPress, backgroundColor, iconName, iconSize = 16, iconColor = '#fff', size = 36, style }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const scaleTo = (toValue) => {
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: Platform.OS !== 'web',
      friction: 6,
      tension: 80,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => scaleTo(1.2)}
      onHoverOut={() => scaleTo(1)}
      onMouseEnter={() => scaleTo(1.2)}
      onMouseLeave={() => scaleTo(1)}
      onPressIn={() => scaleTo(1.2)}
      onPressOut={() => scaleTo(1)}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        <FontAwesome name={iconName} size={iconSize} color={iconColor} />
      </Animated.View>
    </Pressable>
  );
}

const SOCIAL_BADGES = [
  { iconName: 'facebook', backgroundColor: '#1877F2', url: 'https://www.facebook.com/sharer/sharer.php?u=', sharesUrl: true },
  { iconName: 'instagram', backgroundColor: '#E4405F', url: 'https://instagram.com', sharesUrl: false, note: 'Links to Instagram profile' },
  { iconName: 'twitter', backgroundColor: '#000', url: 'https://twitter.com/intent/tweet?url=', sharesUrl: true },
  { iconName: 'linkedin', backgroundColor: '#0077B5', url: 'https://www.linkedin.com/sharing/share-offsite/?url=', sharesUrl: true },
  { iconName: 'youtube', backgroundColor: '#FF0000', url: 'https://youtube.com', sharesUrl: false, note: 'Links to YouTube channel' },
  { iconName: 'music', backgroundColor: '#000', url: 'https://tiktok.com', sharesUrl: false, note: 'Links to TikTok profile' },
  { iconName: 'whatsapp', backgroundColor: '#25D366', url: 'https://wa.me/?text=', sharesUrl: true },
  { iconName: 'telegram', backgroundColor: '#0088cc', url: 'https://t.me/share/url?url=', sharesUrl: true },
];

// Helper function to get the current page URL and create share message
function getShareUrl(badge) {
  // If badge doesn't share URL (Instagram, YouTube, TikTok), just return the direct link
  if (!badge.sharesUrl) {
    return badge.url;
  }
  
  const currentUrl = Platform.OS === 'web' 
    ? window.location.href 
    : 'https://prolynwear.com'; // Fallback URL for mobile
  
  const shareMessage = `Check out Green Health Clinic - Online Functional & Holistic Medicine: ${currentUrl}`;
  
  // Different platforms have different URL encoding requirements
  if (badge.iconName === 'whatsapp') {
    return badge.url + encodeURIComponent(shareMessage);
  } else if (badge.iconName === 'telegram') {
    return badge.url + encodeURIComponent(currentUrl) + '&text=' + encodeURIComponent('Check out Green Health Clinic - Online Functional & Holistic Medicine');
  } else {
    // Facebook, Twitter, LinkedIn
    return badge.url + encodeURIComponent(currentUrl);
  }
}

// Social Media Icon Row Component
function SocialMediaIconRow() {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 50,
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 12
    }}>
      {SOCIAL_BADGES.map((badge) => {
        const shareUrl = getShareUrl(badge);
        
        return (
          <AnimatedSocialIconBadge
            key={badge.iconName + badge.url}
            onPress={() => Linking.openURL(shareUrl)}
            backgroundColor={badge.backgroundColor}
            iconName={badge.iconName}
            iconSize={18}
            style={{ marginRight: 0 }}
          />
        );
      })}
    </View>
  );
}

// Floating Social Column — fixed to right edge on desktop/tablet, hidden on mobile
function FloatingSocialColumn() {
  // Only render on web; on native there is no concept of a fixed sidebar
  if (Platform.OS !== 'web') return null;

  // One animated value per icon: drives both translateX and opacity
  const anims = useRef(
    SOCIAL_BADGES.map(() => ({
      translateX: new Animated.Value(80),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const animations = anims.map((anim) =>
      Animated.parallel([
        Animated.spring(anim.translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7,
          tension: 60,
        }),
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ])
    );
    // Fire each icon's animation 60 ms after the previous one starts
    Animated.stagger(60, animations).start();
  }, []);

  return (
    <View
      style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        marginTop: -104,
        zIndex: 9998,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      }}
      accessibilityRole="navigation"
      accessibilityLabel="Social media links"
    >
      {SOCIAL_BADGES.map((badge, i) => {
        const shareUrl = getShareUrl(badge);
        
        return (
          <Animated.View
            key={badge.iconName + badge.url}
            style={{
              opacity: anims[i].opacity,
              transform: [{ translateX: anims[i].translateX }],
            }}
          >
            <AnimatedSocialIconBadge
              onPress={() => Linking.openURL(shareUrl)}
              backgroundColor={badge.backgroundColor}
              iconName={badge.iconName}
              iconSize={18}
              size={40}
              style={{ marginRight: 0 }}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

// ─── Blog Service ─────────────────────────────────────────────────────────────
const blogService = {
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('date', { ascending: false });
      
      // Apply filters if provided
      if (filters.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map database fields to match the component's expected structure
      return (data || []).map(post => ({
        id: post.id,
        title: post.title,
        category: post.category,
        date: post.date,
        duration: post.duration || 'N/A',
        excerpt: post.excerpt || '',
        thumbnail: post.thumbnail || '',
        videoId: post.video_id || '',
      }));
    } catch (error) {
      console.error('blogService.getAll error:', error);
      throw error;
    }
  }
};

// ─── Static blog data ────────────────────────────────────────────────────────
const BLOG_POSTS = [
  {
    id: 'b1',
    title: 'Understanding Functional Medicine: A Holistic Approach to Health',
    category: 'Functional Medicine',
    date: 'July 12, 2026',
    duration: '5:42',
    excerpt: `Functional medicine looks beyond symptoms to uncover the root causes of chronic illness. Here's how it differs from conventional care and why it matters for long-term wellness.`,
    thumbnail: 'https://img.youtube.com/vi/KJ6lhOPMCCE/maxresdefault.jpg',
    videoId: 'KJ6lhOPMCCE',
  },
  {
    id: 'b2',
    title: 'Metabolic Health 101: What Your Blood Sugar Is Really Telling You',
    category: 'Metabolic Health',
    date: 'July 5, 2026',
    duration: '7:18',
    excerpt: 'Blood sugar fluctuations affect energy, mood, and weight — even in people without diabetes. Learn the markers to watch and simple lifestyle adjustments that make a real difference.',
    thumbnail: 'https://img.youtube.com/vi/lPkEXfuoHL8/maxresdefault.jpg',
    videoId: 'lPkEXfuoHL8',
  },
  {
    id: 'b3',
    title: 'The Gut–Brain Connection: How Your Digestive Health Shapes Your Mind',
    category: 'Nutrition',
    date: 'June 28, 2026',
    duration: '6:05',
    excerpt: 'Emerging research confirms that gut microbiome diversity directly influences anxiety, cognition, and mood. Discover how to nourish your gut for better mental clarity.',
    thumbnail: 'https://img.youtube.com/vi/1sISguPDlhY/maxresdefault.jpg',
    videoId: '1sISguPDlhY',
  },
  {
    id: 'b4',
    title: 'Chronic Inflammation: The Silent Driver Behind Most Modern Diseases',
    category: 'Chronic Disease',
    date: 'June 20, 2026',
    duration: '8:33',
    excerpt: 'From heart disease to autoimmune conditions, low-grade chronic inflammation is a common thread. Find out what triggers it and how targeted interventions can calm it down.',
    thumbnail: 'https://img.youtube.com/vi/zz4YVJ4aRfg/maxresdefault.jpg',
    videoId: 'zz4YVJ4aRfg',
  },
  {
    id: 'b5',
    title: 'Lab Tests That Actually Matter: Beyond the Standard Panel',
    category: 'Diagnostics',
    date: 'June 14, 2026',
    duration: '5:20',
    excerpt: 'Standard bloodwork misses a lot. We break down the advanced markers — hs-CRP, homocysteine, HOMA-IR — that give a fuller picture of your metabolic and cardiovascular risk.',
    thumbnail: 'https://img.youtube.com/vi/7LEtFbVpMYo/maxresdefault.jpg',
    videoId: '7LEtFbVpMYo',
  },
  {
    id: 'b6',
    title: 'Sleep, Stress and Cortisol: Why Rest Is a Medical Intervention',
    category: 'Lifestyle',
    date: 'June 7, 2026',
    duration: '6:51',
    excerpt: `Poor sleep elevates cortisol, disrupts insulin sensitivity, and accelerates cellular ageing. Here's the science behind sleep optimisation and practical protocols to get started tonight.`,
    thumbnail: 'https://img.youtube.com/vi/nm1TxQj9IsQ/maxresdefault.jpg',
    videoId: 'nm1TxQj9IsQ',
  },
  {
    id: 'b7',
    title: 'Nutrition Myths Debunked: What the Latest Research Actually Says',
    category: 'Nutrition',
    date: 'May 30, 2026',
    duration: '7:44',
    excerpt: `From dietary fat being bad to eating six small meals a day — many common nutrition beliefs don't hold up to scrutiny. We look at the evidence and set the record straight.`,
    thumbnail: 'https://img.youtube.com/vi/0bNdhM4vt4I/maxresdefault.jpg',
    videoId: '0bNdhM4vt4I',
  },
  {
    id: 'b8',
    title: 'Hormone Balance After 40: What Changes and What You Can Do',
    category: 'Functional Medicine',
    date: 'May 22, 2026',
    duration: '9:12',
    excerpt: 'Oestrogen, testosterone, thyroid and insulin all shift as we age. Understanding these changes and working with them — rather than against them — is the cornerstone of healthy ageing.',
    thumbnail: 'https://img.youtube.com/vi/TmFKNTKfFTk/maxresdefault.jpg',
    videoId: 'TmFKNTKfFTk',
  },
  {
    id: 'b9',
    title: 'Movement as Medicine: Why Exercise Prescriptions Are the Future',
    category: 'Lifestyle',
    date: 'May 15, 2026',
    duration: '5:09',
    excerpt: 'Exercise is the most evidence-backed intervention in preventive medicine. We explore how personalised movement prescriptions are transforming patient outcomes across chronic conditions.',
    thumbnail: 'https://img.youtube.com/vi/aXItOY0sLRY/maxresdefault.jpg',
    videoId: 'aXItOY0sLRY',
  },
];

const PATIENT_STORIES = [
  {
    id: 'ps1',
    name: 'Amara Mensah',
    condition: 'Type 2 Diabetes Reversal',
    quote: `After years of medication, I was told my diabetes was "manageable but not reversible." Six months into the programme, my HbA1c is normal and I'm off two medications.`,
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  },
  {
    id: 'ps2',
    name: 'Kofi Asante',
    condition: 'Chronic Fatigue & Brain Fog',
    quote: `I'd spent three years feeling exhausted despite sleeping 9 hours a night. The team identified a gut dysbiosis and nutrient deficiencies I never knew I had. I feel like myself again.`,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: 'ps3',
    name: 'Efua Boateng',
    condition: 'Autoimmune Thyroiditis',
    quote: 'Conventional doctors kept adjusting my levothyroxine dose but never asked why my immune system was attacking my thyroid. Here they actually looked for the root cause — and found it.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
  },
  {
    id: 'ps4',
    name: 'Kwame Osei',
    condition: 'Cardiovascular Risk Reduction',
    quote: `My cardiologist said my numbers were "borderline" and to come back in a year. The functional medicine team ran a deeper panel, found the real risk factors, and built a plan. Two years on, I'm thriving.`,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  },
];

const BLOG_PAGE_SIZE = 6;

// ─── Blog Page Component ──────────────────────────────────────────────────────
function BlogPage({ isUserDarkMode, isPhoneScreen, isTabletScreen }) {
  const bg        = isUserDarkMode ? darkPalette.background   : palette.background;
  const surface   = isUserDarkMode ? darkPalette.surface      : palette.surface;
  const charcoal  = isUserDarkMode ? darkPalette.charcoal     : palette.charcoal;
  const green     = isUserDarkMode ? darkPalette.oxblood      : palette.oxblood;
  const greenSoft = isUserDarkMode ? darkPalette.secondary    : palette.secondary;
  const border    = isUserDarkMode ? darkPalette.border       : palette.border;

  const [blogSearch, setBlogSearch]           = useState('');
  const [visibleCount, setVisibleCount]       = useState(BLOG_PAGE_SIZE);
  const [expandedStory, setExpandedStory]     = useState(null);
  const [activeVideo, setActiveVideo]         = useState(null); // post object or null
  const [blogPosts, setBlogPosts]             = useState([]);
  const [loading, setLoading]                 = useState(true);

  // Fetch blog posts from Supabase
  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        setLoading(true);
        const posts = await blogService.getAll({ is_published: true });
        setBlogPosts(posts || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts(BLOG_POSTS); // Fallback to static data if Supabase fails
      } finally {
        setLoading(false);
      }
    }
    fetchBlogPosts();
  }, []);

  const filtered = blogPosts.filter(p =>
    p.title.toLowerCase().includes(blogSearch.toLowerCase())
  );
  const visible  = filtered.slice(0, visibleCount);
  const hasMore  = visibleCount < filtered.length;

  // Reset pagination when search changes
  useEffect(() => {
    setVisibleCount(BLOG_PAGE_SIZE);
  }, [blogSearch]);

  const cols = isPhoneScreen ? 1 : isTabletScreen ? 2 : 3;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Page header ── */}
      <View style={{
        paddingHorizontal: isPhoneScreen ? 16 : 40,
        paddingTop: isPhoneScreen ? 28 : 48,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: border,
      }}>
        <Text style={{
          fontSize: isPhoneScreen ? 26 : 36,
          fontWeight: '700',
          fontFamily: 'Georgia',
          color: green,
          marginBottom: 6,
        }}>Blog & Insights</Text>
        <Text style={{
          fontSize: isPhoneScreen ? 14 : 16,
          color: greenSoft,
          marginBottom: 20,
          lineHeight: 22,
        }}>Evidence-based video content on functional medicine, nutrition, metabolic health and more.</Text>

        {/* ── Search bar ── */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: surface,
          borderWidth: 1,
          borderColor: border,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: isPhoneScreen ? 10 : 12,
          maxWidth: 520,
        }}>
          <FontAwesome name="search" size={16} color={greenSoft} style={{ marginRight: 10 }} />
          <TextInput
            value={blogSearch}
            onChangeText={setBlogSearch}
            placeholder="Search videos by title…"
            placeholderTextColor={isUserDarkMode ? '#666' : '#aaa'}
            style={{
              flex: 1,
              fontSize: 15,
              color: charcoal,
              outlineStyle: 'none',   // web: remove focus ring (react-native-web)
            }}
            clearButtonMode="while-editing"
            accessibilityLabel="Search blog posts"
          />
          {blogSearch.length > 0 && (
            <Pressable onPress={() => setBlogSearch('')} style={{ padding: 4 }}>
              <FontAwesome name="times-circle" size={16} color={greenSoft} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Blog posts grid ── */}
      <View style={{
        paddingHorizontal: isPhoneScreen ? 16 : 40,
        paddingTop: 32,
      }}>
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={green} />
            <Text style={{ fontSize: 14, color: greenSoft, marginTop: 16 }}>Loading videos...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <FontAwesome name="search" size={36} color={border} style={{ marginBottom: 14 }} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: charcoal, marginBottom: 6 }}>No videos found</Text>
            <Text style={{ fontSize: 14, color: greenSoft }}>Try a different search term.</Text>
          </View>
        ) : (
          <>
            {/* Responsive grid using rows */}
            {Array.from({ length: Math.ceil(visible.length / cols) }).map((_, rowIdx) => (
              <View
                key={rowIdx}
                style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}
              >
                {visible.slice(rowIdx * cols, rowIdx * cols + cols).map((post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    flex={1}
                    isUserDarkMode={isUserDarkMode}
                    surface={surface}
                    charcoal={charcoal}
                    green={green}
                    greenSoft={greenSoft}
                    border={border}
                    isPhoneScreen={isPhoneScreen}
                    onPlay={() => setActiveVideo(post)}
                  />
                ))}
                {/* Fill empty cells in last row */}
                {visible.slice(rowIdx * cols, rowIdx * cols + cols).length < cols &&
                  Array.from({ length: cols - visible.slice(rowIdx * cols, rowIdx * cols + cols).length }).map((_, fi) => (
                    <View key={'fill-' + fi} style={{ flex: 1 }} />
                  ))
                }
              </View>
            ))}

            {/* ── Load More / result count ── */}
            <View style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
              <Text style={{ fontSize: 13, color: greenSoft }}>
                Showing {visible.length} of {filtered.length} video{filtered.length !== 1 ? 's' : ''}
              </Text>
              {hasMore && (
                <Pressable
                  onPress={() => setVisibleCount(v => v + BLOG_PAGE_SIZE)}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? '#1e5010' : green,
                    paddingVertical: 12,
                    paddingHorizontal: 32,
                    borderRadius: 8,
                    marginTop: 6,
                  })}
                  accessibilityRole="button"
                  accessibilityLabel="Load more videos"
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 }}>
                    Load More
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </View>

      {/* ── Video lightbox ── */}
      <Modal
        visible={activeVideo !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActiveVideo(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.88)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isPhoneScreen ? 0 : 24,
          }}
          onPress={() => setActiveVideo(null)}
        >
          {/* Inner card — stop propagation so tapping inside doesn't close */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 860,
              backgroundColor: '#000',
              borderRadius: isPhoneScreen ? 0 : 16,
              overflow: 'hidden',
            }}
          >
            {/* Header bar */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#111',
            }}>
              <Text style={{
                color: '#fff',
                fontSize: isPhoneScreen ? 13 : 15,
                fontWeight: '600',
                flex: 1,
                marginRight: 12,
              }} numberOfLines={1}>{activeVideo?.title}</Text>
              <Pressable
                onPress={() => setActiveVideo(null)}
                style={{ padding: 6 }}
                accessibilityRole="button"
                accessibilityLabel="Close video"
              >
                <FontAwesome name="times" size={20} color="#fff" />
              </Pressable>
            </View>

            {/* Responsive 16:9 video container - Universal Player */}
            <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' }}>
              {activeVideo && (() => {
                // Use shared video source detection utility
                const { rawSource, isDirectVideo, videoUrl, videoId } = getVideoSource(activeVideo);
                
                // BUG FIX 2: Native player support
                if (Platform.OS !== 'web') {
                  if (isDirectVideo && videoUrl) {
                    // Native direct video playback
                    return (
                      <Video
                        source={{ uri: videoUrl }}
                        style={{ width: '100%', height: '100%' }}
                        useNativeControls
                        resizeMode="contain"
                        shouldPlay
                      />
                    );
                  } else if (videoId) {
                    // Native YouTube playback - show message since WebView would need extra setup
                    return (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 }}>
                        <FontAwesome name="youtube-play" size={64} color="#ff0000" style={{ marginBottom: 16 }} />
                        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
                          YouTube video playback
                        </Text>
                        <Text style={{ color: '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
                          This video plays on YouTube. Please use the web version or YouTube app.
                        </Text>
                        <Text style={{ color: '#666', fontSize: 11, textAlign: 'center' }}>
                          Video ID: {videoId}
                        </Text>
                      </View>
                    );
                  } else {
                    return (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <FontAwesome name="exclamation-triangle" size={48} color="#666" />
                        <Text style={{ color: '#888', marginTop: 12 }}>Video source not available</Text>
                      </View>
                    );
                  }
                }

                // Web platform - existing logic with corrected variables
                let embedSrc = '';
                
                // Direct video URL (MP4, WebM, etc.)
                if (isDirectVideo && videoUrl) {
                  return (
                    <View style={{ flex: 1 }}>
                      {React.createElement('video', {
                        src: videoUrl,
                        controls: true,
                        autoPlay: true,
                        style: {
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        },
                      })}
                    </View>
                  );
                }
                
                // YouTube: Extract video ID from various URL formats
                if (videoId) {
                  let ytId = videoId;
                  
                  // Check if videoId is actually a full URL
                  if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
                    const ytMatch = videoId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                    if (ytMatch) ytId = ytMatch[1];
                  }
                  
                  if (ytId && ytId.length === 11) {
                    embedSrc = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
                  }
                }
                
                // Mux: Handle Mux video player with playback ID
                else if (rawSource && (rawSource.includes('mux.com') || rawSource.includes('stream.mux'))) {
                  // Extract playback ID from Mux URL
                  const muxMatch = rawSource.match(/([a-zA-Z0-9_-]{16,})/);
                  if (muxMatch) {
                    const playbackId = muxMatch[1];
                    embedSrc = `https://stream.mux.com/${playbackId}.m3u8`;
                    
                    // For Mux, use an HLS-compatible player
                    return (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                        <FontAwesome name="exclamation-triangle" size={48} color="#ff9800" style={{ marginBottom: 16 }} />
                        <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8, textAlign: 'center', paddingHorizontal: 20 }}>
                          Video temporarily unavailable
                        </Text>
                        <Text style={{ color: '#aaa', fontSize: 13, textAlign: 'center', paddingHorizontal: 20 }}>
                          This video requires a specialized player. Please contact support if this persists.
                        </Text>
                      </View>
                    );
                  }
                }
                
                // Vimeo: Extract video ID
                else if (rawSource && rawSource.includes('vimeo.com')) {
                  const vimeoMatch = rawSource.match(/vimeo\.com\/(\d+)/);
                  if (vimeoMatch) {
                    embedSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
                  }
                }
                
                // Generic iframe-compatible URL
                else if (rawSource && !isDirectVideo) {
                  embedSrc = rawSource;
                }
                
                // Render iframe for embedded content
                if (embedSrc) {
                  return (
                    <View style={{ flex: 1 }}>
                      {React.createElement('iframe', {
                        src: embedSrc,
                        style: {
                          width: '100%',
                          height: '100%',
                          border: 'none',
                        },
                        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                        allowFullScreen: true,
                        title: activeVideo.title,
                      })}
                    </View>
                  );
                }
                
                // Fallback: No valid video source
                return (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesome name="exclamation-triangle" size={48} color="#666" />
                    <Text style={{ color: '#888', marginTop: 12 }}>Video source not available</Text>
                  </View>
                );
              })()}
            </View>

            {/* Footer meta */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              backgroundColor: '#111',
            }}>
              <View style={{
                backgroundColor: '#1a3a0f',
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 20,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#6db84a' }}>
                  {activeVideo?.category_name || activeVideo?.category}
                </Text>
              </View>
              <FontAwesome name="clock-o" size={12} color="#888" />
              <Text style={{ fontSize: 12, color: '#888' }}>
                {activeVideo?.video_duration || activeVideo?.duration}
              </Text>
              <Text style={{ fontSize: 12, color: '#666', marginLeft: 'auto' }}>
                {activeVideo?.date || (activeVideo?.published_at ? new Date(activeVideo.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')}
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Patient Stories section ── */}
      <View style={{
        marginTop: 16,
        paddingTop: 40,
        paddingBottom: 40,
        paddingHorizontal: isPhoneScreen ? 16 : 40,
        backgroundColor: isUserDarkMode ? darkPalette.surface : '#eef5e8',
        borderTopWidth: 1,
        borderTopColor: border,
      }}>
        <Text style={{
          fontSize: isPhoneScreen ? 22 : 30,
          fontWeight: '700',
          fontFamily: 'Georgia',
          color: green,
          marginBottom: 6,
        }}>Patient Stories</Text>
        <Text style={{
          fontSize: isPhoneScreen ? 13 : 15,
          color: greenSoft,
          marginBottom: 28,
          lineHeight: 22,
        }}>Real experiences from patients whose lives have been transformed through functional medicine.</Text>

        <View style={{ gap: 20 }}>
          {Array.from({ length: Math.ceil(PATIENT_STORIES.length / (isPhoneScreen ? 1 : 2)) }).map((_, rowIdx) => {
            const rowCols = isPhoneScreen ? 1 : 2;
            const rowItems = PATIENT_STORIES.slice(rowIdx * rowCols, rowIdx * rowCols + rowCols);
            return (
              <View key={rowIdx} style={{ flexDirection: 'row', gap: 20 }}>
                {rowItems.map((story) => (
                  <PatientStoryCard
                    key={story.id}
                    story={story}
                    isUserDarkMode={isUserDarkMode}
                    surface={surface}
                    charcoal={charcoal}
                    green={green}
                    greenSoft={greenSoft}
                    border={border}
                    isPhoneScreen={isPhoneScreen}
                    expanded={expandedStory === story.id}
                    onToggle={() => setExpandedStory(id => id === story.id ? null : story.id)}
                  />
                ))}
                {rowItems.length < (isPhoneScreen ? 1 : 2) && (
                  <View style={{ flex: 1 }} />
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Video Source Detection Utility ───────────────────────────────────────────
function getVideoSource(post) {
  const rawSource = post.video_id || post.videoId || '';
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(rawSource);
  const videoUrl = isDirectVideo ? rawSource : '';
  const videoId = isDirectVideo ? '' : rawSource;
  
  return { rawSource, isDirectVideo, videoUrl, videoId };
}

// ─── Blog Video Card with Auto-Play on Viewport Visibility ────────────────────
function BlogCard({ post, flex, isUserDarkMode, surface, charcoal, green, greenSoft, border, isPhoneScreen, onPlay }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  const scaleTo = (v) => Animated.spring(scaleAnim, { toValue: v, useNativeDriver: true, friction: 7, tension: 80 }).start();

  const thumbnailHeight = isPhoneScreen ? 180 : 200;

  // Support both static data format and Supabase format
  const thumbnail = post.video_thumbnail || post.thumbnail || post.featured_image_url;
  const duration = post.video_duration || post.duration;
  const category = post.category_name || post.category;
  
  // Get video source info
  const { isDirectVideo, videoUrl, videoId } = getVideoSource(post);
  const canAutoPlay = isDirectVideo && videoUrl;

  // Set up IntersectionObserver for viewport visibility detection
  useEffect(() => {
    if (Platform.OS !== 'web' || !cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Load video when card is near viewport (with buffer)
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setShouldLoadVideo(true);
          }
          
          // Play when fully visible, pause when out of view
          setIsVisible(entry.isIntersecting && entry.intersectionRatio > 0.5);
        });
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '100px', // Load videos 100px before they enter viewport
      }
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  // Control video playback based on visibility (web)
  useEffect(() => {
    if (Platform.OS !== 'web' || !videoRef.current || !canAutoPlay) return;

    if (isVisible) {
      videoRef.current.play().catch(() => {
        // Autoplay failed (e.g., browser policy), ignore silently
      });
    } else {
      videoRef.current.pause();
    }
  }, [isVisible, canAutoPlay]);

  // Mobile: Use onLayout and scroll position tracking (simplified)
  const [mobileVisible, setMobileVisible] = useState(true); // Start visible on mobile

  const showVideo = Platform.OS === 'web' ? (isVisible && canAutoPlay && shouldLoadVideo) : (mobileVisible && canAutoPlay);

  return (
    <Pressable
      ref={cardRef}
      style={{ flex }}
      onPressIn={() => scaleTo(0.97)}
      onPressOut={() => scaleTo(1)}
      onPress={onPlay}
      accessibilityRole="button"
      accessibilityLabel={'Watch video: ' + post.title}
    >
      <Animated.View style={{
        flex: 1,
        backgroundColor: surface,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isUserDarkMode ? 0.3 : 0.07,
        shadowRadius: 8,
        transform: [{ scale: scaleAnim }],
      }}>

        {/* ── Thumbnail / Video container ── */}
        <View style={{ width: '100%', height: thumbnailHeight, position: 'relative' }}>
          {/* Thumbnail (always rendered as base layer) */}
          <Image
            source={{ uri: thumbnail }}
            style={{ width: '100%', height: thumbnailHeight, position: 'absolute' }}
            resizeMode="cover"
          />

          {/* Auto-playing video preview (web) */}
          {showVideo && Platform.OS === 'web' && shouldLoadVideo && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              {React.createElement('video', {
                ref: videoRef,
                src: videoUrl,
                muted: true,
                loop: true,
                playsInline: true,
                preload: 'metadata',
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                },
              })}
            </View>
          )}
          
          {/* Auto-playing video preview (mobile) */}
          {showVideo && Platform.OS !== 'web' && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <Video
                source={{ uri: videoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                shouldPlay={mobileVisible}
                isLooping
                isMuted
              />
            </View>
          )}

          {/* Muted/speaker-off icon overlay (when video is playing) */}
          {showVideo && (
            <View style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.65)',
              paddingHorizontal: 6,
              paddingVertical: 4,
              borderRadius: 4,
            }}>
              <FontAwesome name="volume-off" size={12} color="#fff" />
            </View>
          )}

          {/* Duration badge — bottom-right */}
          <View style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.72)',
            paddingHorizontal: 7,
            paddingVertical: 3,
            borderRadius: 5,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}>
            <FontAwesome name="clock-o" size={10} color="#fff" />
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600' }}>{duration}</Text>
          </View>
        </View>

        {/* ── Card body ── */}
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <View style={{
              backgroundColor: isUserDarkMode ? '#1a3a0f' : '#e8f5e9',
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 20,
            }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: green }}>{category}</Text>
            </View>
          </View>
          <Text style={{
            fontSize: isPhoneScreen ? 15 : 16,
            fontWeight: '700',
            color: charcoal,
            marginBottom: 8,
            lineHeight: 22,
          }} numberOfLines={2}>{post.title}</Text>
          <Text style={{
            fontSize: 13,
            color: greenSoft,
            lineHeight: 19,
            marginBottom: 14,
          }} numberOfLines={3}>{post.excerpt}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: isUserDarkMode ? '#555' : '#999' }}>{post.date}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <FontAwesome name="play-circle" size={13} color={green} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: green }}>Watch now</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ─── Patient Story Card ───────────────────────────────────────────────────────
function PatientStoryCard({ story, isUserDarkMode, surface, charcoal, green, greenSoft, border, isPhoneScreen, expanded, onToggle }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const scaleTo = (v) => Animated.spring(scaleAnim, { toValue: v, useNativeDriver: true, friction: 7, tension: 80 }).start();

  return (
    <Animated.View style={{
      flex: 1,
      backgroundColor: surface,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isUserDarkMode ? 0.3 : 0.08,
      shadowRadius: 10,
      transform: [{ scale: scaleAnim }],
    }}>
      <View style={{ flexDirection: isPhoneScreen ? 'column' : 'row', alignItems: isPhoneScreen ? 'center' : 'flex-start', padding: 20, gap: 16 }}>
        <Image
          source={{ uri: story.image }}
          style={{
            width: 72, height: 72,
            borderRadius: 36,
            borderWidth: 3,
            borderColor: green,
          }}
          resizeMode="cover"
        />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: charcoal, marginBottom: 2 }}>{story.name}</Text>
          <View style={{
            alignSelf: 'flex-start',
            backgroundColor: isUserDarkMode ? '#1a3a0f' : '#e8f5e9',
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 20,
            marginBottom: 10,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: green }}>{story.condition}</Text>
          </View>
          <Text style={{
            fontSize: 14,
            color: greenSoft,
            lineHeight: 21,
            fontStyle: 'italic',
          }} numberOfLines={expanded ? undefined : 3}>
            "{story.quote}"
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onToggle}
        onHoverIn={() => scaleTo(1.01)}
        onHoverOut={() => scaleTo(1)}
        onMouseEnter={() => scaleTo(1.01)}
        onMouseLeave={() => scaleTo(1)}
        onPressIn={() => scaleTo(0.99)}
        onPressOut={() => scaleTo(1)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: border,
          backgroundColor: isUserDarkMode ? '#1a3a0f' : '#f4faf0',
        }}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse story' : 'Read full story of ' + story.name}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: green }}>
          {expanded ? 'Show less' : 'Read full story'}
        </Text>
        <FontAwesome name={expanded ? 'chevron-up' : 'chevron-down'} size={12} color={green} />
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Old HeroSlider component removed - now imported from components/HeroSlider.jsx
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');

  const [search, setSearch] = useState('');

  const [cartItems, setCartItems] = useState([]);



  // Cart Bottom Sheet State & Animation

  const [cartModalVisible, setCartModalVisible] = useState(false);

  const cartSheetAnim = useRef(new Animated.Value(1)).current;



  const openCart = () => {

    setCartModalVisible(true);

    Animated.spring(cartSheetAnim, {

      toValue: 0,

      useNativeDriver: true,

      friction: 8,

      tension: 40,

    }).start();

  };



  const closeCart = () => {

    Animated.timing(cartSheetAnim, {

      toValue: 1,

      duration: 220,

      useNativeDriver: true,

    }).start(() => {

      setCartModalVisible(false);

    });

  };

  

  // User Auth State

  const [user, setUser] = useState(null);

  const [authModalVisible, setAuthModalVisible] = useState(false);

  const [userAccountSheetVisible, setUserAccountSheetVisible] = useState(false);

  const [isLoginMode, setIsLoginMode] = useState(false);

  const [authName, setAuthName] = useState('');

  const [authPassword, setAuthPassword] = useState('');

  const [authEmail, setAuthEmail] = useState('');

  const [authInterests, setAuthInterests] = useState([]);

  const [authLoading, setAuthLoading] = useState(false);

  

  // Current Page Route

  const [currentPage, setCurrentPage] = useState('home');

  const [currency, setCurrency] = useState('GHC');
  
  // Consultation card visibility (mobile modal)
  const [consultationCardVisible, setConsultationCardVisible] = useState(false);

  const [adminEmail, setAdminEmail] = useState('');

  const [ratesUpdated, setRatesUpdated] = useState(0);

  const [servicesDropdownVisible, setServicesDropdownVisible] = useState(false);

  const [aboutDropdownVisible, setAboutDropdownVisible] = useState(false);

  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);

  const [mobileAboutExpanded, setMobileAboutExpanded] = useState(false);

  const [activeServiceSection, setActiveServiceSection] = useState('functional-medicine');
  
  // Services data from Supabase
  const [servicesData, setServicesData] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  
  // Patient stories data from Supabase
  const [patientStoriesData, setPatientStoriesData] = useState([]);
  const [patientStoriesLoading, setPatientStoriesLoading] = useState(true);
  const [patientStoriesError, setPatientStoriesError] = useState('');

  // About sections data from Supabase
  const [aboutSectionsData, setAboutSectionsData] = useState([]);
  const [aboutSectionsLoading, setAboutSectionsLoading] = useState(true);
  const [aboutSectionsError, setAboutSectionsError] = useState('');

  const servicesScrollViewRef = useRef(null);
  const isServicesScrollingProgrammatically = useRef(false);
  const servicesChipBarHeight = useRef(116); // Will be measured dynamically
  const sectionOffsets = useRef({ 'functional-medicine': 0, 'metabolic-health': 0, 'chronic-disease': 0, 'nutrition': 0, 'diagnostics': 0, 'pharmacy': 0 });
  const sectionRefs = useRef({
    'functional-medicine': null,
    'metabolic-health': null,
    'chronic-disease': null,
    'nutrition': null,
    'diagnostics': null,
    'pharmacy': null,
  });

  const [activeAboutSection, setActiveAboutSection] = useState('our-story');

  const aboutScrollViewRef = useRef(null);
  const isAboutScrollingProgrammatically = useRef(false);
  const aboutChipBarHeight = useRef(116); // Will be measured dynamically
  const aboutSectionOffsets = useRef({ 'our-story': 0, 'our-team': 0, 'patient-stories': 0, 'blog-news': 0, 'vision-mission': 0 });

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const arrowRotation = useRef(new Animated.Value(0)).current;

  const aboutDropdownAnim = useRef(new Animated.Value(0)).current;

  const aboutArrowRotation = useRef(new Animated.Value(0)).current;

  const mobileMenuAnim = useRef(new Animated.Value(0)).current;

// const isCartPage = currentPage === 'cart'; // moved to later block

// const isShopPage = currentPage === 'shop'; // moved

// const isAdminPage = currentPage === 'adminLogin'; // removed duplicate



  useEffect(() => {

    const fetchLiveRates = async () => {

      try {

        const response = await fetch('https://open.er-api.com/v6/latest/USD');

        const data = await response.json();

        if (data && data.rates) {

          if (data.rates.EUR) currencyRates.EUR.rate = data.rates.EUR;

          if (data.rates.GBP) currencyRates.GBP.rate = data.rates.GBP;

          if (data.rates.NGN) currencyRates.NGN.rate = data.rates.NGN;

          if (data.rates.GHS) currencyRates.GHC.rate = data.rates.GHS; // API uses GHS

          setRatesUpdated(Date.now());

        }

      } catch (err) {

        console.warn('Failed to fetch live currency rates:', err.message);

      }

    };

    fetchLiveRates();

  }, []);

  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const [categoryChips, setCategoryChips] = useState(['All', ...fallbackChips]);

  const [productCards, setProductCards] = useState(fallbackCategoryCards);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [categoriesError, setCategoriesError] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productDetailVisible, setProductDetailVisible] = useState(false);

  

  // Checkout & Order states

  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  const [customerName, setCustomerName] = useState('');

  const [customerPhone, setCustomerPhone] = useState('');

  const [customerEmail, setCustomerEmail] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const [orderSuccessModalVisible, setOrderSuccessModalVisible] = useState(false);

  const [lastCreatedOrderId, setLastCreatedOrderId] = useState('');

  const [localOrders, setLocalOrders] = useState([]);

  

  // Admin Profile State

  const [adminAvatarUrl, setAdminAvatarUrl] = useState('https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80');

  const [adminProfileModalVisible, setAdminProfileModalVisible] = useState(false);

  const [tempAvatarUrl, setTempAvatarUrl] = useState('');

  

  // Customer Account State

  const [customerOrders, setCustomerOrders] = useState([]);

  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false);

  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  // heroSlides state removed - now fetched inside HeroSlider component



  // Footer Accordion State

  const [expandedFooterSections, setExpandedFooterSections] = useState({

    aboutUs: false,

    mainMenu: false,

    links: false,

    contact: false,

  });

  const [isFooterOpen, setIsFooterOpen] = useState(false);

  // Share Menu State & Animation
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuAnim = useRef(new Animated.Value(0)).current;



  const toggleFooterSection = (section) => {

    setExpandedFooterSections(prev => ({

      ...prev,

      [section]: !prev[section]

    }));

  };

  const toggleShareMenu = () => {
    if (isShareMenuOpen) {
      Animated.timing(shareMenuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsShareMenuOpen(false));
    } else {
      setIsShareMenuOpen(true);
      Animated.timing(shareMenuAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };



  const [dbFooterSections, setDbFooterSections] = useState(fallbackFooterSections);



  const halalSealItem = null;

  const halalSealSource = null;



  // Dark Mode States (separate for user and admin)

  const [isUserDarkMode, setIsUserDarkMode] = useState(false);

  const [isAdminDarkMode, setIsAdminDarkMode] = useState(false);



  // Admin order states

  const [adminOrders, setAdminOrders] = useState([]);

  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);

  const [adminOrdersError, setAdminOrdersError] = useState('');

  const [activeAdminTab, setActiveAdminTab] = useState('Dashboard');



  // Rider management states

  const [riders, setRiders] = useState([]);

  const [ridersLoading, setRidersLoading] = useState(false);

  const [newRiderName, setNewRiderName] = useState('');

  const [newRiderPhone, setNewRiderPhone] = useState('');

  const [newRiderNotes, setNewRiderNotes] = useState('');

  const [addRiderLoading, setAddRiderLoading] = useState(false);

  const [showAddRiderForm, setShowAddRiderForm] = useState(false);



  // Rider Picker Modal state

  const [riderPickerVisible, setRiderPickerVisible] = useState(false);

  const [riderPickerOrder, setRiderPickerOrder] = useState(null);

  const [riderPickerDelivery, setRiderPickerDelivery] = useState(null);

  const [riderSendingId, setRiderSendingId] = useState(null);



  // Customer CRM state

  const [customerSearch, setCustomerSearch] = useState('');

  const [expandedCustomerPhone, setExpandedCustomerPhone] = useState(null);

  const [customerMsgModal, setCustomerMsgModal] = useState(null); // holds customer object

  const [customMsgText, setCustomMsgText] = useState('');



  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  const drawerAnim = useRef(new Animated.Value(-260)).current;



  const openAdminDrawer = () => {

    setAdminDrawerOpen(true);

    Animated.spring(drawerAnim, {

      toValue: 0,

      useNativeDriver: true,

      friction: 8,

      tension: 50,

    }).start();

  };



  const closeAdminDrawer = () => {

    Animated.timing(drawerAnim, {

      toValue: -260,

      duration: 220,

      useNativeDriver: true,

    }).start(() => setAdminDrawerOpen(false));

  };



  const navigateAdminTab = (tab) => {

    setActiveAdminTab(tab);

    closeAdminDrawer();

  };

  

  // Admin catalog states

  const [addProductModalVisible, setAddProductModalVisible] = useState(false);

  const [editProductModalVisible, setEditProductModalVisible] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  

  // Category Maps

  const [catNameToIdMap, setCatNameToIdMap] = useState({});

  

  const [newProduct, setNewProduct] = useState({

    name: '',

    price_s: '',

    price_m: '',

    price_l: '',

    price_xl: '',

    price_xxl: '',

    price: '',

    has_sizes: true,

    has_weights: true, // Keep for backward compatibility

    tag: '',

    category_name: '',

    description: '',

    image_url: '',

    stock_quantity: '',

  });



  const reveal = useRef(new Animated.Value(0)).current;

  const lift = useRef(new Animated.Value(20)).current;

  const cartBarAnim = useRef(new Animated.Value(0)).current;

  const { width, height: windowHeight } = useWindowDimensions();





  useEffect(() => {

    Animated.parallel([

      Animated.timing(reveal, {

        toValue: 1,

        duration: 700,

        useNativeDriver: true,

      }),

      Animated.timing(lift, {

        toValue: 0,

        duration: 700,

        useNativeDriver: true,

      }),

    ]).start();

  }, [lift, reveal]);



  useEffect(() => {

    if (servicesDropdownVisible) {

      Animated.parallel([

        Animated.timing(dropdownAnim, {

          toValue: 1,

          duration: 200,

          useNativeDriver: true,

        }),

        Animated.timing(arrowRotation, {

          toValue: 1,

          duration: 200,

          useNativeDriver: true,

        }),

      ]).start();

    } else {

      Animated.parallel([

        Animated.timing(dropdownAnim, {

          toValue: 0,

          duration: 200,

          useNativeDriver: true,

        }),

        Animated.timing(arrowRotation, {

          toValue: 0,

          duration: 200,

          useNativeDriver: true,

        }),

      ]).start();

    }

  }, [servicesDropdownVisible]);



  useEffect(() => {

    if (aboutDropdownVisible) {

      Animated.parallel([

        Animated.timing(aboutDropdownAnim, {

          toValue: 1,

          duration: 200,

          useNativeDriver: true,

        }),

        Animated.timing(aboutArrowRotation, {

          toValue: 1,

          duration: 200,

          useNativeDriver: true,

        }),

      ]).start();

    } else {

      Animated.parallel([

        Animated.timing(aboutDropdownAnim, {

          toValue: 0,

          duration: 200,

          useNativeDriver: true,

        }),

        Animated.timing(aboutArrowRotation, {

          toValue: 0,

          duration: 200,

          useNativeDriver: true,

        }),

      ]).start();

    }

  }, [aboutDropdownVisible]);



  useEffect(() => {

    if (mobileMenuVisible) {

      Animated.timing(mobileMenuAnim, {

        toValue: 1,

        duration: 300,

        useNativeDriver: true,

      }).start();

    } else {

      Animated.timing(mobileMenuAnim, {

        toValue: 0,

        duration: 300,

        useNativeDriver: true,

      }).start();

    }

  }, [mobileMenuVisible]);



const fetchFooterData = async () => {

    try {

      const { data, error } = await supabase

        .from('footer_sections')

        .select(`

          id,

          section_key,

          title,

          sort_order,

          footer_items!footer_items_footer_section_id_fkey (

            id,

            label,

            action_type,

            action_value,

            icon_library,

            icon_name,

            sort_order

          )

        `)

        .order('sort_order', { ascending: true });



      if (error) throw error;



      if (data && data.length > 0) {

        const sortedData = data.map(section => ({

          ...section,

          footer_items: (section.footer_items || []).sort((a, b) => a.sort_order - b.sort_order)

        }));

        setDbFooterSections(sortedData);

      }

    } catch (err) {

      console.warn('Failed to load Supabase footer schema, using hardcoded fallback:', err.message);

    }

  };



  const loadSupabaseData = async (showLoading = true) => {

    fetchFooterData();
    fetchServicesData(); // Load services from Supabase
    fetchPatientStoriesData(); // Load patient stories from Supabase
    fetchAboutSectionsData(); // Load about sections from Supabase

    if (showLoading) {

      setCategoriesLoading(true);

    }

    setCategoriesError('');



    let productData = [];

    let success = false;

    let catNameToImageMap = {};

    let catIdToNameMap = {};

    let catNameToId = {};

    let categoryNames = [];

    let fetchError = null;



    console.log('🔄 Starting product fetch from Supabase...');

    console.log('Supabase URL configured:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);



    // 1. Try querying Supabase directly

    try {

      console.log('📡 Attempting direct Supabase query...');

      

      // Fetch products with medicine-specific fields

      let prodRes = await supabase.from('products').select('*');

      

      console.log('🔍 Raw prodRes:', { 

        hasError: !!prodRes.error, 

        dataLength: prodRes.data?.length,

        errorMessage: prodRes.error?.message 

      });

      

      // If products loaded successfully, try to fetch their images

      if (prodRes.data && prodRes.data.length > 0) {

        const productIds = prodRes.data.map(p => p.id);

        const imagesRes = await supabase

          .from('product_images')

          .select('*')

          .in('product_id', productIds)

          .order('position', { ascending: true });

        

        if (imagesRes.data && !imagesRes.error) {

          console.log(`📸 Loaded ${imagesRes.data.length} product images`);

          // Attach images to products

          prodRes.data = prodRes.data.map(product => ({

            ...product,

            product_images: imagesRes.data.filter(img => img.product_id === product.id)

          }));

        } else {

          console.log('⚠️ Could not load product images:', imagesRes.error?.message);

        }

      }

      

      const catRes = await supabase.from('categories').select('*');

      

      if (prodRes.error) {

        console.error('❌ Products query error:', prodRes.error);

        throw prodRes.error;

      }

      

      console.log('✅ Products fetched from Supabase:', prodRes.data?.length || 0, 'products');
      

      

      if (catRes.data) {

        catRes.data.forEach(c => {

          if (c.id && c.name) {

            catIdToNameMap[c.id] = c.name;

            catNameToId[c.name.toLowerCase()] = c.id;

          }

          if (c.image_url) catNameToImageMap[c.name] = c.image_url;

          if (c.name) categoryNames.push(c.name);

        });

        setCatNameToIdMap(catNameToId);

        console.log('📂 Categories loaded:', catRes.data.length);

      }



      if (prodRes.data && prodRes.data.length > 0) {

        // Sort product_images by position for each product

        productData = prodRes.data.map(product => ({

          ...product,

          product_images: product.product_images 

            ? product.product_images.sort((a, b) => (a.position || 0) - (b.position || 0))

            : []

        }));

        success = true;

        console.log('✅ Successfully loaded', productData.length, 'products from Supabase');

      } else {

        console.log('✅ Backend connected successfully, but products table is empty (0 products)');

        console.log('💡 Using fallback demo products for display');

      }

    } catch (err) {

      console.error('❌ Direct Supabase fetch failed:', err.message);

      fetchError = err.message;

      setCategoriesError('Supabase Error: ' + err.message);

      

      if (err.message?.includes('JWT') || err.message?.includes('expired')) {

        supabase.auth.signOut();

      }

    }



    // 2. Try proxy server if direct fetch failed

    if (!success) {

      try {

        console.log('📡 Trying proxy server fallback...');

        const response = await fetch(`${LOCAL_API_BASE}/api/products`);

        if (response.ok) {

          productData = await response.json();

          success = true;

          console.log('✅ Products fetched via proxy:', productData.length);

        } else {

          throw new Error(`Proxy status ${response.status}`);

        }

      } catch (error) {

        console.warn('⚠️ Proxy fetch failed:', error.message);

      }

    }



    if (success && productData && productData.length > 0) {

      const nextCards = productData

        .map(row => mapProductRowToCard(row, catNameToImageMap, catIdToNameMap))

        .filter((card) => card.name)

        .sort((left, right) => {

          const leftPosition = Number(left.position ?? 0);

          const rightPosition = Number(right.position ?? 0);

          if (leftPosition !== rightPosition) {

            return leftPosition - rightPosition;

          }

          return left.name.localeCompare(right.name);

        });



      setProductCards(nextCards);

      console.log('✅ Displaying', nextCards.length, 'products from Supabase');

      

      // Extract chips from already-mapped cards using categoryLabel (safe, already normalised)

      const isValidCategory = (val) => {

        if (!val || typeof val !== 'string') return false;

        const trimmed = val.trim();

        if (trimmed.length === 0 || trimmed.length > 60) return false;

        // Reject anything that looks like a URL or file path

        if (/^https?:\/\//i.test(trimmed)) return false;

        if (/\.(jpg|jpeg|png|gif|webp|svg|mp4|pdf)$/i.test(trimmed)) return false;

        return true;

      };



      const categoriesFromCards = new Set(categoryNames);

      if (categoriesFromCards.size === 0) {

        nextCards.forEach((card) => {

          if (isValidCategory(card.categoryLabel)) categoriesFromCards.add(card.categoryLabel.trim());

          else if (isValidCategory(card.tag)) categoriesFromCards.add(card.tag.trim());

        });

      }



      const dynamicChips = ['All', ...Array.from(categoriesFromCards).sort()];

      setCategoryChips(dynamicChips.length > 1 ? dynamicChips : ['All', ...fallbackChips]);

      

      // Clear error since we successfully loaded from Supabase

      setCategoriesError('');

    } else {

      // 3. Fall back to local data when Supabase fetch failed or returned empty

      console.log('🔄 Showing fallback demo products...');

      const errorMsg = fetchError 

        ? `⚠️ Backend Error: ${fetchError}`

        : '✅ Backend connected. Database is empty - showing demo products.';

      setCategoriesError(errorMsg);

      setProductCards(fallbackCategoryCards);

      setCategoryChips(['All', ...fallbackChips]);

      console.log('✅ Displaying', fallbackCategoryCards.length, 'fallback products');

    }



    setCategoriesLoading(false);

  };



  // Manual refresh function for user to retry loading products

  const refreshProducts = () => {

    loadSupabaseData(true);

  };



  useEffect(() => {

    loadSupabaseData();

    

    // Auth Listener

    supabase.auth.getSession().then(({ data: { session } }) => {

      setUser(session?.user ?? null);

      if (session?.user) {

        setCustomerName(session.user.user_metadata?.full_name || '');

        setCustomerEmail(session.user.email || '');

      }

    });



    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {

      setUser(session?.user ?? null);

      if (session?.user) {

        setCustomerName(session.user.user_metadata?.full_name || '');

        setCustomerEmail(session.user.email || '');

      }

    });



    return () => {

      authListener.subscription.unsubscribe();

    };

  }, []);



  useEffect(() => {

    if (currentPage === 'admin') {

      fetchAdminOrders();

      fetchRiders();

    }

    if (currentPage === 'account') {

      fetchCustomerOrders();

    }

  }, [currentPage, user]);



  useEffect(() => {

    // Legacy auto-advance removed — HeroSlider component manages its own timer

    return () => {};

  }, []);



  // HERO_SLIDES removed - now fetched directly in HeroSlider component from Supabase



  // Fetch services data from Supabase
  const fetchServicesData = async () => {
    try {
      setServicesLoading(true);
      console.log('🔄 Fetching services from Supabase...');
      const services = await serviceService.getAll();
      setServicesData(services || []);
      console.log(`✅ Loaded ${services?.length || 0} services from Supabase`);
      setServicesError('');
    } catch (error) {
      console.error('❌ Failed to fetch services:', error);
      setServicesError(`Failed to load services: ${error.message}`);
      setServicesData([]);
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch patient stories data from Supabase
  const fetchPatientStoriesData = async () => {
    try {
      setPatientStoriesLoading(true);
      console.log('🔄 Fetching patient stories from Supabase...');
      const stories = await patientStoryService.getAll();
      setPatientStoriesData(stories || []);
      console.log(`✅ Loaded ${stories?.length || 0} patient stories from Supabase`);
      setPatientStoriesError('');
    } catch (error) {
      console.error('❌ Failed to fetch patient stories:', error);
      setPatientStoriesError(`Failed to load patient stories: ${error.message}`);
      setPatientStoriesData([]);
    } finally {
      setPatientStoriesLoading(false);
    }
  };

  // Fetch about sections data from Supabase
  const fetchAboutSectionsData = async () => {
    try {
      setAboutSectionsLoading(true);
      console.log('🔄 Fetching about sections from Supabase...');
      const aboutSections = await aboutService.getAll();
      console.log('📊 About sections response:', aboutSections);
      setAboutSectionsData(aboutSections || []);
      console.log(`✅ Loaded ${aboutSections?.length || 0} about sections from Supabase`);
      setAboutSectionsError('');
    } catch (error) {
      console.error('❌ Failed to fetch about sections:', error);
      console.error('❌ Error details:', error.message, error.details || '');
      setAboutSectionsError(`Failed to load about sections: ${error.message}`);
      setAboutSectionsData([]);
    } finally {
      setAboutSectionsLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {

    if (!user) {

      console.log('❌ Cannot fetch orders: User not logged in');

      return;

    }

    

    console.log('🔄 Fetching customer orders for user:', user.id);

    setCustomerOrdersLoading(true);

    

    try {

      // Fetch orders with order_items and product details

      const { data, error } = await supabase

        .from('orders')

        .select(`

          *,

          order_items (

            *,

            products (

              id,

              name,

              image_url,

              description

            )

          )

        `)

        .eq('user_id', user.id)

        .order('created_at', { ascending: false });

      

      if (error) {

        console.error('❌ Error fetching orders:', error);

        throw error;

      }

      

      console.log('✅ Orders fetched from Supabase:', data?.length || 0, 'orders');

      

      // Map product data to order items for easy access

      const ordersWithProducts = (data || []).map(order => {

        console.log('📦 Order:', order.id, 'Items:', order.order_items?.length || 0);

        return {

          ...order,

          order_items: (order.order_items || []).map(item => {

            const productInfo = {

              ...item,

              product_name: item.products?.name || 'Product',

              product_image: item.products?.image_url || null

            };

            console.log('  - Item:', productInfo.product_name, 'Qty:', item.quantity);

            return productInfo;

          })

        };

      });

      

      setCustomerOrders(ordersWithProducts);

      console.log('✅ Customer orders state updated');

    } catch (err) {

      console.warn('⚠️ Error fetching customer orders:', err.message);

      // Fallback to basic query if join fails

      try {

        console.log('🔄 Trying fallback query without product join...');

        const { data, error } = await supabase

          .from('orders')

          .select('*, order_items(*)')

          .eq('user_id', user.id)

          .order('created_at', { ascending: false });

        

        if (!error) {

          console.log('✅ Fallback query successful:', data?.length || 0, 'orders');

          setCustomerOrders(data || []);

        } else {

          console.error('❌ Fallback query failed:', error);

        }

      } catch (fallbackErr) {

        console.warn('❌ Fallback query also failed:', fallbackErr.message);

      }

    } finally {

      setCustomerOrdersLoading(false);

    }

  };



  // Checkout and Order Placement Flow

  const submitOrder = async () => {

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {

      alert('Please fill in Name, Phone, and Delivery Address.');

      return;

    }



    console.log('🛒 Submitting order...');

    console.log('  User ID:', user?.id || 'Guest');

    console.log('  Cart Items:', cartItems.length);

    

    setIsSubmittingOrder(true);

    const mockOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const totalAmount = cartItems.reduce((total, item) => total + item.lineTotal, 0);



    try {

      console.log('📝 Creating order in Supabase...');

      // 1. Insert order metadata

      const { data: orderData, error: orderError } = await supabase

        .from('orders')

        .insert([

          {

            user_id: user?.id || null,

            total: totalAmount,

            status: 'Pending',

            metadata: {

              customer_name: customerName.trim(),

              customer_email: customerEmail.trim() || 'no-email@store.com',

              customer_phone: customerPhone.trim(),

              delivery_address: deliveryAddress.trim(),

            }

          },

        ])

        .select();



      if (orderError) {

        console.error('❌ Error creating order:', orderError);

        throw orderError;

      }

      if (!orderData || orderData.length === 0) {

        console.error('❌ No order data returned from Supabase');

        throw new Error('No order data returned from Supabase');

      }



      const newOrderId = orderData[0].id;

      console.log('✅ Order created:', newOrderId);



      // 2. Insert order items

      console.log('📦 Adding order items...');

      const orderItemsToInsert = cartItems.map((item) => ({

        order_id: newOrderId,

        product_id: item.id.toString().startsWith('prod-') ? null : item.id,

        selected_weight: item.selectedWeight,

        unit_price: item.unitPrice,

        quantity: item.quantity,

        line_total: item.lineTotal,

      }));



      console.log('  Items to insert:', orderItemsToInsert.length);

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

      if (itemsError) {

        console.error('❌ Error inserting order items:', itemsError);

        throw itemsError;

      }



      console.log('✅ Order items inserted successfully');

      console.log('🎉 Order completed successfully!');



      setLastCreatedOrderId(newOrderId);

      setOrderSuccessModalVisible(true);

      setCartItems([]);

      clearCheckoutForm();

      

      // Refresh order history if user is logged in

      if (user) {

        console.log('🔄 Refreshing order history...');

        fetchCustomerOrders();

      } else {

        console.log('⚠️ User not logged in, skipping order history refresh');

      }

    } catch (err) {

      console.warn('⚠️ Supabase checkout failed, falling back to local simulation:', err.message);

      

      // Local Order Simulation

      const simulatedOrder = {

        id: mockOrderId,

        total: totalAmount,

        status: 'Pending',

        created_at: new Date().toISOString(),

        metadata: {

          customer_name: customerName.trim(),

          customer_email: customerEmail.trim() || 'no-email@store.com',

          customer_phone: customerPhone.trim(),

          delivery_address: deliveryAddress.trim(),

        },

        order_items: cartItems.map((item) => ({

          id: `item-${Math.random().toString(36).substr(2, 9)}`,

          product_name: item.name,

          selected_weight: item.selectedWeight,

          unit_price: item.unitPrice,

          quantity: item.quantity,

          line_total: item.lineTotal,

        })),

      };



      setLocalOrders((prev) => [simulatedOrder, ...prev]);

      setLastCreatedOrderId(mockOrderId);

      setOrderSuccessModalVisible(true);

      setCartItems([]);

      clearCheckoutForm();

      

      // Add to customer orders for display

      if (user) {

        setCustomerOrders((prev) => [simulatedOrder, ...prev]);

      }

    } finally {

      setIsSubmittingOrder(false);

      setCheckoutModalVisible(false);

    }

  };



  const clearCheckoutForm = () => {

    setDeliveryAddress('');

    setCustomerPhone('');

    // Intentionally keep customerName and Email if they are logged in

  };



  // Check if user is admin using profiles table

  const checkAdmin = async (user) => {

    try {

      const { data: profile, error } = await supabase

        .from('profiles')

        .select('role')

        .eq('id', user.id)

        .single();

      

      if (error) {

        console.log('Error fetching profile:', error);

        return false;

      }

      

      return profile?.role === 'admin';

    } catch (err) {

      console.log('Error checking admin status:', err);

      return false;

    }

  };



  // Auth Handlers

  const handleAuth = async () => {

    setAuthLoading(true);

    if (!authEmail || !authPassword || (!isLoginMode && !authName)) {

      alert('Please fill all fields');

      setAuthLoading(false);

      return;

    }



    try {

      if (isLoginMode) {

        // Sign in with Supabase

        const { data: { user }, error } = await supabase.auth.signInWithPassword({

          email: authEmail.trim(),

          password: authPassword,

        });

        if (error) throw error;



        // Check admin using profiles table

        const isAdmin = await checkAdmin(user);

        

        if (isAdmin) {

          setAdminUnlocked(true);

          setCurrentPage('admin');

        } else {

          setCurrentPage('shop');

        }

        setAuthModalVisible(false);

      } else {

        const { error } = await supabase.auth.signUp({

          email: authEmail,

          password: authPassword,

          options: {

            data: {

              full_name: authName,

              interests: authInterests,

            }

          }

        });

        if (error) throw error;

        setAuthModalVisible(false);

        alert('Welcome to Prolyn Wear! Your account has been created.');

      }

    } catch (err) {

      alert(err.message);

    } finally {

      setAuthLoading(false);

    }

  };



  const handleLogout = async () => {

    await supabase.auth.signOut();

    setCurrentPage('shop');

  };



  const INTERESTS = [];

  const toggleInterest = (interest) => {

    setAuthInterests(prev => 

      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]

    );

  };



  // Admin Order Retrieval & Actions

  const fetchAdminOrders = async () => {

    setAdminOrdersLoading(true);

    setAdminOrdersError('');

    try {

      const { data, error } = await supabase

        .from('orders')

        .select('*, order_items(*)')

        .order('created_at', { ascending: false });



      if (error) throw error;

      

      // Merge live database orders with locally simulated orders

      const mergedOrders = [...localOrders, ...(data || [])];

      setAdminOrders(mergedOrders);

    } catch (err) {

      console.warn('Could not fetch Supabase orders. Using local simulation data:', err.message);

      setAdminOrders(localOrders);

    } finally {

      setAdminOrdersLoading(false);

    }

  };



  const updateOrderStatus = async (orderId, newStatus) => {

    // Optimistic UI update for immediate feedback

    setAdminOrders((prev) =>

      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))

    );



    // If it's a simulated order

    if (orderId.toString().startsWith('ORD-')) {

      setLocalOrders((prev) =>

        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))

      );

      return; // UI is already updated

    }



    try {

      const { data, error } = await supabase

        .from('orders')

        .update({ status: newStatus })

        .eq('id', orderId)

        .select();



      if (error) throw error;

      

      // If no rows were returned, RLS might have silently blocked it.

      if (!data || data.length === 0) {

        console.warn('Update succeeded but no rows were modified. Check Supabase RLS.');

      }



      // Re-fetch to ensure sync, but UI is already optimistically updated

      fetchAdminOrders();

    } catch (err) {

      alert('Failed to update status in database: ' + err.message);

      // Revert optimistic update by re-fetching

      fetchAdminOrders();

    }

  };



  const deleteOrder = async (orderId) => {

    // Optimistic UI update

    setAdminOrders((prev) => prev.filter((o) => o.id !== orderId));



    if (orderId.toString().startsWith('ORD-')) {

      setLocalOrders((prev) => prev.filter((o) => o.id !== orderId));

      return;

    }



    try {

      const { data, error } = await supabase.from('orders').delete().eq('id', orderId).select();

      if (error) throw error;

      if (!data || data.length === 0) {

        throw new Error("Supabase RLS policy prevented deletion. Please add a DELETE policy for the 'orders' table in your Supabase dashboard.");

      }

      fetchAdminOrders();

    } catch (err) {

      alert('Failed to delete order: ' + err.message);

      fetchAdminOrders(); // Revert optimistic delete

    }

  };



  // ─── Rider CRUD Functions ─────────────────────────────────────────────────

  const fetchRiders = async () => {

    setRidersLoading(true);

    try {

      const { data, error } = await supabase

        .from('riders')

        .select('*')

        .order('created_at', { ascending: true });

      if (error) throw error;

      setRiders(data || []);

    } catch (err) {

      console.warn('Could not fetch riders:', err.message);

      setRiders([]);

    } finally {

      setRidersLoading(false);

    }

  };



  const addRider = async () => {

    if (!newRiderName.trim() || !newRiderPhone.trim()) {

      alert('Please enter rider name and phone number.');

      return;

    }

    setAddRiderLoading(true);

    try {

      const { data, error } = await supabase

        .from('riders')

        .insert([{ name: newRiderName.trim(), phone: newRiderPhone.trim(), notes: newRiderNotes.trim(), is_active: true }])

        .select();

      if (error) throw error;

      setRiders(prev => [...prev, ...(data || [])]);

      setNewRiderName('');

      setNewRiderPhone('');

      setNewRiderNotes('');

      setShowAddRiderForm(false);

    } catch (err) {

      alert('Failed to add rider: ' + err.message);

    } finally {

      setAddRiderLoading(false);

    }

  };



  const toggleRiderActive = async (riderId, currentValue) => {

    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, is_active: !currentValue } : r));

    try {

      const { error } = await supabase

        .from('riders')

        .update({ is_active: !currentValue })

        .eq('id', riderId);

      if (error) throw error;

    } catch (err) {

      alert('Failed to update rider status: ' + err.message);

      setRiders(prev => prev.map(r => r.id === riderId ? { ...r, is_active: currentValue } : r));

    }

  };



  const deleteRider = async (riderId) => {

    setRiders(prev => prev.filter(r => r.id !== riderId));

    try {

      const { error } = await supabase.from('riders').delete().eq('id', riderId);

      if (error) throw error;

    } catch (err) {

      alert('Failed to delete rider: ' + err.message);

      fetchRiders();

    }

  };

  // ──────────────────────────────────────────────────────────────────────────



  const filteredCategories = useMemo(() => {



    const query = search.trim().toLowerCase();

    return productCards.filter((card) => {

      const selected = activeCategory === 'All' || card.categoryLabel === activeCategory || card.name === activeCategory;

      const searchable = `${card.name} ${card.description} ${card.tag ?? ''} ${card.categoryLabel ?? ''}`.toLowerCase();

      const matchesQuery = query.length === 0 || searchable.includes(query);

      return selected && matchesQuery;

    });

  }, [activeCategory, productCards, search]);



  const analyticsData = useMemo(() => {

    const now = new Date();

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);



    let currentWeekRevenue = 0;

    let lastWeekRevenue = 0;

    let currentWeekOrders = 0;

    let lastWeekOrders = 0;



    adminOrders.forEach(o => {

      const date = new Date(o.created_at || now);

      if (date >= oneWeekAgo) {

        currentWeekRevenue += Number(o.total_amount) || 0;

        currentWeekOrders++;

      } else if (date >= twoWeeksAgo) {

        lastWeekRevenue += Number(o.total_amount) || 0;

        lastWeekOrders++;

      }

    });



    const revGrowth = lastWeekRevenue === 0 ? (currentWeekRevenue > 0 ? 100 : 0) : Math.round(((currentWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100);

    const orderGrowth = lastWeekOrders === 0 ? (currentWeekOrders > 0 ? 100 : 0) : Math.round(((currentWeekOrders - lastWeekOrders) / lastWeekOrders) * 100);



    const getStyle = (growth) => {

      if (growth > 0) return { bg: styles.adminBadgeGreen, text: styles.adminBadgeGreenText };

      if (growth < 0) return { bg: styles.adminBadgeRed, text: styles.adminBadgeRedText };

      return { bg: styles.adminBadgeGray, text: styles.adminBadgeGrayText };

    };



    return {

      revGrowthStr: revGrowth > 0 ? `+${revGrowth}%` : `${revGrowth}%`,

      orderGrowthStr: orderGrowth > 0 ? `+${orderGrowth}%` : `${orderGrowth}%`,

      revStyle: getStyle(revGrowth),

      orderStyle: getStyle(orderGrowth),

    };

  }, [adminOrders]);



  // Admin Catalog Actions

  const adminAddProduct = async () => {

    if (!newProduct.name) {

      alert('Please enter a product name.');

      return;

    }



    let pS = null, pM = null, pL = null, pXL = null, pXXL = null, pUnit = null;



    if (newProduct.has_sizes) {

      if (!newProduct.price_s || !newProduct.price_m || !newProduct.price_l || !newProduct.price_xl || !newProduct.price_xxl) {

        alert('Please enter prices for all size variants (S, M, L, XL, XXL).');

        return;

      }

      pS = parseFloat(newProduct.price_s);

      pM = parseFloat(newProduct.price_m);

      pL = parseFloat(newProduct.price_l);

      pXL = parseFloat(newProduct.price_xl);

      pXXL = parseFloat(newProduct.price_xxl);

      if (isNaN(pS) || isNaN(pM) || isNaN(pL) || isNaN(pXL) || isNaN(pXXL)) {

        alert('All prices must be valid numbers.');

        return;

      }

    } else {

      if (!newProduct.price) {

        alert('Please enter a unit price.');

        return;

      }

      pUnit = parseFloat(newProduct.price);

      if (isNaN(pUnit)) {

        alert('Price must be a valid number.');

        return;

      }

    }



    // Find category ID from name

    const catNameInput = newProduct.category_name.trim();

    const resolvedCategoryId = catNameToIdMap[catNameInput.toLowerCase()] || catNameInput || null;



    const productRow = {

      name: newProduct.name.trim(),

      price_s: pS,

      price_m: pM,

      price_l: pL,

      price_xl: pXL,

      price_xxl: pXXL,

      price: pUnit,

      has_sizes: newProduct.has_sizes,

      has_weights: newProduct.has_sizes, // Keep for backward compatibility

      tag: newProduct.tag.trim() || null,

      category_id: resolvedCategoryId,

      description: newProduct.description.trim() || '',

      url: newProduct.image_url.trim() || null,

      stock_quantity: parseInt(newProduct.stock_quantity) || 0,

    };



    try {

      const { error } = await supabase.from('products').insert([productRow]);

      if (error) throw error;



      setAddProductModalVisible(false);

      setNewProduct({ name: '', price_s: '', price_m: '', price_l: '', price_xl: '', price_xxl: '', price: '', has_sizes: true, has_weights: true, tag: '', category_name: '', description: '', image_url: '', stock_quantity: '' });

      loadSupabaseData();

    } catch (err) {

      console.warn('Failed to insert product in Supabase. Simulating locally:', err.message);

      

      const newLocalCard = {

        id: `prod-${Math.random().toString(36).substr(2, 9)}`,

        name: productRow.name,

        price_s: productRow.price_s,

        price_m: productRow.price_m,

        price_l: productRow.price_l,

        price_xl: productRow.price_xl,

        price_xxl: productRow.price_xxl,

        price: productRow.price,

        hasSizes: productRow.has_sizes,

        hasWeights: productRow.has_sizes,

        tag: productRow.tag,

        categoryLabel: newProduct.category_name,

        description: productRow.description,

        image: productRow.image_url || DEFAULT_CATEGORY_IMAGE,

        position: 0,

      };



      setProductCards((prev) => [newLocalCard, ...prev]);

      setAddProductModalVisible(false);

      setNewProduct({ name: '', price_s: '', price_m: '', price_l: '', price_xl: '', price_xxl: '', price: '', has_sizes: true, has_weights: true, tag: '', category_name: '', description: '', image_url: '', stock_quantity: '' });

    }

  };



  const adminDeleteProduct = async (id) => {

    // If it's a simulated local product

    if (id.toString().startsWith('prod-')) {

      setProductCards((prev) => prev.filter((p) => p.id !== id));

      return;

    }



    try {

      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      loadSupabaseData();

    } catch (err) {

      console.warn('Failed to delete product from Supabase. Removing locally:', err.message);

      setProductCards((prev) => prev.filter((p) => p.id !== id));

    }

  };



  const adminEditProduct = async () => {

    if (!editingProduct.name) {

      alert('Please enter a product name.');

      return;

    }



    let pS = null, pM = null, pL = null, pXL = null, pXXL = null, pUnit = null;



    if (editingProduct.hasSizes || editingProduct.hasWeights) {

      if (!editingProduct.price_s || !editingProduct.price_m || !editingProduct.price_l || !editingProduct.price_xl || !editingProduct.price_xxl) {

        alert('Please enter prices for all size variants (S, M, L, XL, XXL).');

        return;

      }

      pS = parseFloat(editingProduct.price_s);

      pM = parseFloat(editingProduct.price_m);

      pL = parseFloat(editingProduct.price_l);

      pXL = parseFloat(editingProduct.price_xl);

      pXXL = parseFloat(editingProduct.price_xxl);

      if (isNaN(pS) || isNaN(pM) || isNaN(pL) || isNaN(pXL) || isNaN(pXXL)) {

        alert('All prices must be valid numbers.');

        return;

      }

    } else {

      if (!editingProduct.price) {

        alert('Please enter a unit price.');

        return;

      }

      pUnit = parseFloat(editingProduct.price);

      if (isNaN(pUnit)) {

        alert('Price must be a valid number.');

        return;

      }

    }



    // Check if it's simulated local product

    if (editingProduct.id.toString().startsWith('prod-') || editingProduct.id.toString().includes('prod-')) {

      setProductCards((prev) =>

        prev.map((p) => (p.id === editingProduct.id ? { 

          ...editingProduct, 

          price_s: pS, 

          price_m: pM, 

          price_l: pL,

          price_xl: pXL,

          price_xxl: pXXL,

          price: pUnit,

          hasSizes: editingProduct.hasSizes || editingProduct.hasWeights,

          hasWeights: editingProduct.hasSizes || editingProduct.hasWeights

        } : p))

      );

      setEditProductModalVisible(false);

      setEditingProduct(null);

      return;

    }



    // Find category ID from name

    const catNameInput = (editingProduct.categoryLabel?.trim() || editingProduct.tag?.trim() || '');

    const resolvedCategoryId = catNameToIdMap[catNameInput.toLowerCase()] || catNameInput || null;



    const updatedFields = {

      name: editingProduct.name.trim(),

      price_s: pS,

      price_m: pM,

      price_l: pL,

      price_xl: pXL,

      price_xxl: pXXL,

      price: pUnit,

      has_sizes: editingProduct.hasSizes || editingProduct.hasWeights,

      has_weights: editingProduct.hasSizes || editingProduct.hasWeights,

      tag: editingProduct.tag?.trim() || null,

      category_id: resolvedCategoryId,

      description: editingProduct.description?.trim() || '',

      url: editingProduct.image?.trim() || null,

      stock_quantity: parseInt(editingProduct.stock_quantity) || 0,

    };



    // --- Optimistic local update: shop reflects changes immediately ---

    const optimisticCard = {

      ...editingProduct,

      name: editingProduct.name.trim(),

      price_s: pS ?? editingProduct.price_s,

      price_m: pM ?? editingProduct.price_m,

      price_l: pL ?? editingProduct.price_l,

      price_xl: pXL ?? editingProduct.price_xl,

      price_xxl: pXXL ?? editingProduct.price_xxl,

      price: pUnit ?? editingProduct.price,

      hasSizes: editingProduct.hasSizes || editingProduct.hasWeights,

      hasWeights: editingProduct.hasSizes || editingProduct.hasWeights,

      tag: editingProduct.tag?.trim() || null,

      description: editingProduct.description?.trim() || '',

      image:      editingProduct.image?.trim() || editingProduct.image,

      stock_quantity: parseInt(editingProduct.stock_quantity) || 0,

    };

    setProductCards((prev) =>

      prev.map((p) => (p.id === editingProduct.id ? { ...p, ...optimisticCard } : p))

    );

    setEditProductModalVisible(false);

    setEditingProduct(null);



    // --- Sync to Supabase: refresh session first, then update ---

    try {

      // 1. Ensure a valid JWT session

      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {

        const { data: refreshData } = await supabase.auth.refreshSession();

        session = refreshData?.session;

      }

      if (!session) {

        alert('Admin session expired. Sign out and back in to save changes to the database.');

        return;

      }



      // 2. Push update

      const { error } = await supabase

        .from('products')

        .update(updatedFields)

        .eq('id', editingProduct.id);



      if (error) throw error;



      // 3. Verify it landed

      const { data: verified } = await supabase

        .from('products')

        .select('id, name')

        .eq('id', editingProduct.id)

        .single();



      if (verified) {

        console.log('✅ Supabase confirmed update:', verified.name);

        loadSupabaseData();

      } else {

        alert('Saved locally. Supabase did not confirm the update — please sign out and back in as admin.');

      }

    } catch (err) {

      console.warn('Supabase update failed:', err.message);

      alert(`Changes saved locally only.\nError: ${err.message}\n\nSign out and back in as admin, then try again.`);

    }

  };



  function LoginModal({ email, setEmail, password, setPassword, onSubmit, onCancel }) {

    return (

      <ScrollView contentContainerStyle={styles.adminLoginContent} showsVerticalScrollIndicator={false}>

        <View style={styles.adminLoginCard}>

          <Text style={styles.cartPageKicker}>SIGN IN</Text>

          <Text style={styles.adminLoginTitle}>Enter your email and password.</Text>

          <Text style={styles.adminLoginBody}>

            Use your account to access the store.

          </Text>



          <View style={styles.adminLoginField}>

            <Text style={styles.adminLoginLabel}>Email</Text>

            <TextInput

              value={email}

              onChangeText={setEmail}

              autoCapitalize="none"

              keyboardType="email-address"

              placeholder="you@example.com"

              placeholderTextColor="#89726F"

              style={styles.adminLoginInput}

            />

          </View>

          <View style={styles.adminLoginField}>

            <Text style={styles.adminLoginLabel}>Password</Text>

            <TextInput

              value={password}

              onChangeText={setPassword}

              secureTextEntry={true}

              placeholder="Password"

              placeholderTextColor="#89726F"

              style={styles.adminLoginInput}

            />

          </View>

          <Pressable style={styles.adminLoginButton} onPress={onSubmit}>

            <Text style={styles.adminLoginButtonText}>SIGN IN</Text>

          </Pressable>

          <Pressable style={styles.adminLoginCancelButton} onPress={onCancel}>

            <Text style={styles.adminLoginCancelText}>BACK TO SHOP</Text>

          </Pressable>

        </View>

      </ScrollView>

    );

  }



  const MIN_CARD = 160;

  const GAP = 12;

  const PADDING = width < 600 ? 12 : width < 980 ? 20 : 32;

  const availableWidth = width - (PADDING * 2);

  const columnCount = width < 600 ? 2 : width < 980 ? 3 : 4;

  const cardWidth = (availableWidth - (GAP * (columnCount - 1))) / columnCount;

  const isCompactCard = cardWidth < 200;

  const isCompactAdmin = width < 760;

  const isPhoneScreen = width < 600;

  const isTabletScreen = width >= 600 && width < 980;

  const isMobileOrTablet = width <= 1400;

  const isCompactShareMenu = width < 1100;

  const formatCurrency = (amount) => formatMoney(amount, currency);



  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);



  useEffect(() => {

    Animated.spring(cartBarAnim, {

      toValue: cartCount > 0 ? 1 : 0,

      useNativeDriver: true,

      friction: 8,

      tension: 40,

    }).start();

  }, [cartCount, cartBarAnim]);

  const cartTotal = cartItems.reduce((total, item) => total + item.lineTotal, 0);

  const isCartPage = false;

  const isAdminPage = currentPage === 'admin';

  const isAdminLoginPage = currentPage === 'adminLogin';

  const isHomePage = currentPage === 'home';

  const isShopPage = currentPage === 'shop';

  const isAccountPage = currentPage === 'account';

  const isServicesPage = currentPage === 'services';

  const isAboutPage = currentPage === 'about';

  const isContactPage = currentPage === 'contact';

  const isBlogsPage = currentPage === 'blogs';

  


  const adminStatsList = useMemo(() => adminStats(productCards.length), [productCards.length]);



  const addToCart = (category, selectedWeight, itemPrice, qty = 1) => {

    const priceNum = Number(itemPrice);

    const quantityToAdd = Number(qty) || 1;



    setCartItems((currentItems) => {

      const existingItemIndex = currentItems.findIndex(

        (item) => item.id === category.id && item.selectedWeight === selectedWeight

      );



      if (existingItemIndex >= 0) {

        return currentItems.map((item, idx) => {

          if (idx !== existingItemIndex) return item;

          const quantity = item.quantity + quantityToAdd;

          return {

            ...item,

            quantity,

            lineTotal: +(item.unitPrice * quantity).toFixed(2),

          };

        });

      }



      return [

        ...currentItems,

        {

          id: category.id,

          name: category.name,

          image: category.image,

          selectedWeight,

          unitPrice: priceNum,

          quantity: quantityToAdd,

          lineTotal: +(priceNum * quantityToAdd).toFixed(2),

        },

      ];

    });

  };



  const setCartQuantity = (category, selectedWeight, itemPrice, quantity) => {

    const priceNum = Number(itemPrice);

    const quantityToSet = Number(quantity) || 1;



    setCartItems((currentItems) => {

      const existingItemIndex = currentItems.findIndex(

        (item) => item.id === category.id && item.selectedWeight === selectedWeight

      );



      if (existingItemIndex >= 0) {

        // Update existing item quantity

        return currentItems.map((item, idx) => {

          if (idx !== existingItemIndex) return item;

          return {

            ...item,

            quantity: quantityToSet,

            lineTotal: +(priceNum * quantityToSet).toFixed(2),

          };

        });

      }



      // Add new item with specified quantity

      return [

        ...currentItems,

        {

          id: category.id,

          name: category.name,

          image: category.image,

          selectedWeight,

          unitPrice: priceNum,

          quantity: quantityToSet,

          lineTotal: +(priceNum * quantityToSet).toFixed(2),

        },

      ];

    });

  };



  const removeFromCart = (categoryId, selectedWeight) => {

    setCartItems((currentItems) =>

      currentItems.filter(

        (item) => !(item.id === categoryId && item.selectedWeight === selectedWeight)

      )

    );

  };



  const changeCartQuantity = (id, selectedWeight, delta) => {

    setCartItems((currentItems) =>

      currentItems

        .map((item) => {

          if (item.id !== id || item.selectedWeight !== selectedWeight) {

            return item;

          }



          const quantity = item.quantity + delta;

          if (quantity <= 0) {

            return null;

          }



          return {

            ...item,

            quantity,

            lineTotal: +(item.unitPrice * quantity).toFixed(2),

          };

        })

        .filter(Boolean),

    );

  };



  const openAdmin = () => {

    setCurrentPage(adminUnlocked ? 'admin' : 'adminLogin');

  };



  const handleLogin = async () => {

    const enteredEmail = authEmail.trim().toLowerCase();



    // Try Supabase login

    try {

      const { data, error } = await supabase.auth.signInWithPassword({

        email: authEmail.trim(),

        password: authPassword,

      });



      if (!error && data?.user) {

        // Check admin using profiles table

        const isAdmin = await checkAdmin(data.user);

        

        if (isAdmin) {

          setAdminUnlocked(true);

          setCurrentPage('admin');

        } else {

          setCurrentPage('shop');

        }

        setAuthModalVisible(false);

        return;

      }

    } catch (err) {

      console.warn('Supabase authentication failed:', err.message);

      alert('Invalid login credentials or authentication error.');

    }

  };



  const submitAdminLogin = async () => {

    try {

      const { data, error } = await supabase.auth.signInWithPassword({

        email: adminEmail.trim(),

        password: authPassword,

      });



      if (error) throw error;



      if (data?.user) {

        const isAdmin = await checkAdmin(data.user);

        

        if (isAdmin) {

          setAdminUnlocked(true);

          setCurrentPage('admin');

        } else {

          alert('You do not have admin privileges.');

        }

      }

    } catch (err) {

      alert('Invalid credentials or authentication error.');

    }

  };



  const uniqueCustomers = useMemo(() => {

    const map = new Map();

    adminOrders.forEach(order => {

      const phone = order.metadata?.customer_phone;

      if (phone) {

        if (!map.has(phone)) {

          map.set(phone, {

            name: order.metadata?.customer_name || 'Guest',

            phone: phone,

            totalSpent: order.total || 0,

            orderCount: 1,

            email: order.metadata?.customer_email || 'N/A',

            orders: [order],

          });

        } else {

          const existing = map.get(phone);

          existing.totalSpent += (order.total || 0);

          existing.orderCount += 1;

          existing.orders.push(order);

          if (order.metadata?.customer_name && existing.name === 'Guest') {

            existing.name = order.metadata.customer_name;

          }

        }

      }

    });

    const arr = Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);



    // Detect duplicates: same name, different phone

    const nameGroups = new Map();

    arr.forEach(c => {

      const key = (c.name || '').trim().toLowerCase();

      if (!nameGroups.has(key)) nameGroups.set(key, []);

      nameGroups.get(key).push(c.phone);

    });

    return arr.map(c => ({

      ...c,

      isDuplicate: (nameGroups.get((c.name || '').trim().toLowerCase()) || []).length > 1,

    }));

  }, [adminOrders]);



  // ─── Admin Dark Mode Palette ───────────────────────────

  const adm = isAdminDarkMode ? {

    bg: '#0F172A',

    surface: '#1E293B',

    surfaceAlt: '#1A2744',

    border: 'rgba(255,255,255,0.08)',

    text: '#F1F5F9',

    sub: '#94A3B8',

    tableHead: '#162032',

    inputBg: '#253347',

  } : {

    bg: '#FAF9F9',

    surface: '#FFFFFF',

    surfaceAlt: '#F9F9F9',

    border: 'rgba(27,28,28,0.08)',

    text: '#1B1C1C',

    sub: '#5F5E5F',

    tableHead: '#F9F9F9',

    inputBg: '#FFFFFF',

  };



  const shareButtonEl = (
    <Pressable
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={toggleShareMenu}
      accessibilityRole="button"
      accessibilityLabel={isShareMenuOpen ? 'Close social links' : 'Open social links'}
    >
      <FontAwesome name="share-alt" size={18} color="#fff" />
    </Pressable>
  );

  const shareIconEls = SOCIAL_BADGES.map((badge) => {
    const shareUrl = getShareUrl(badge);
    
    return (
      <AnimatedSocialIconBadge
        key={badge.iconName + badge.url}
        onPress={() => Linking.openURL(shareUrl)}
        backgroundColor={badge.backgroundColor}
        iconName={badge.iconName}
        iconSize={isCompactShareMenu ? 16 : 16}
        size={isCompactShareMenu ? 36 : 36}
        style={{ marginRight: 0 }}
      />
    );
  });

  return (

    <SafeAreaView style={[styles.safeArea, { backgroundColor: isUserDarkMode ? darkPalette.background : palette.background }]}>

      <StatusBar style={isUserDarkMode ? "light" : "dark"} />

      {isShareMenuOpen && (
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent',
            zIndex: 9999
          }}
          onPress={toggleShareMenu}
        />
      )}



      <View style={[styles.header, isPhoneScreen && { paddingHorizontal: 12 }, {

        backgroundColor: isUserDarkMode ? darkPalette.surface : palette.background,

        borderBottomColor: isUserDarkMode ? '#333' : 'rgba(27, 28, 28, 0.1)',

        zIndex: isShareMenuOpen ? 10001 : 1000,

      }]}>

        {isPhoneScreen ? (

          <>

            <View style={styles.headerLeftMobile}>

              <Pressable style={styles.hamburgerButton} onPress={() => setMobileMenuVisible(true)}>

                <FontAwesome name="bars" size={24} color={isUserDarkMode ? darkPalette.oxblood : palette.oxblood} />

              </Pressable>

              <Image 

                source={require('./assets/original_logo_cropped.png')} 

                style={styles.headerLogo}

                resizeMode="contain"

              />

            </View>

            <View style={styles.headerRight}>

              {!isShopPage && shareButtonEl}

              {isShopPage && (

                <View style={[styles.headerActions, { gap: 6 }]}>

                  <Pressable

                    style={[styles.currencyBtn, { paddingHorizontal: 8, paddingVertical: 4 }, {

                      borderColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood,

                      backgroundColor: isUserDarkMode ? darkPalette.background : '#fff'

                    }]}

                    onPress={() => setCurrency((prev) => currencyOptions[(currencyOptions.indexOf(prev) + 1) % currencyOptions.length])}

                  >

                    <Text style={[styles.currencyBtnText, { fontSize: 10 }, {

                      color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

                    }]}>{currency}</Text>

                  </Pressable>

                  <Pressable style={styles.badgeWrap} onPress={openCart}>

                    <Text style={[styles.headerIcon, { color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood }]}>bag</Text>

                    <View style={styles.badge}>

                      <Text style={styles.badgeText}>{cartCount}</Text>

                    </View>

                  </Pressable>

                </View>

              )}

            </View>

          </>

        ) : (

          <>

            <View style={styles.headerLeft}>

              <Image 

                source={require('./assets/original_logo_cropped.png')} 

                style={styles.headerLogo}

                resizeMode="contain"

              />

            </View>



            <View style={styles.headerCenter}>

              <Pressable onPress={() => setCurrentPage('home')}>

                <Text style={[styles.navLink, {

                  color: currentPage === 'home' ? (isUserDarkMode ? darkPalette.oxblood : palette.oxblood) : (isUserDarkMode ? darkPalette.secondary : palette.secondary),

                  fontWeight: currentPage === 'home' ? '700' : '400'

                }]}>Home</Text>

              </Pressable>

              <Pressable onPress={() => setCurrentPage('shop')}>

                <Text style={[styles.navLink, {

                  color: currentPage === 'shop' ? (isUserDarkMode ? darkPalette.oxblood : palette.oxblood) : (isUserDarkMode ? darkPalette.secondary : palette.secondary),

                  fontWeight: currentPage === 'shop' ? '700' : '400'

                }]}>Shop</Text>

              </Pressable>

              <View 
                style={{ position: 'relative' }}
              >

                <Pressable

                  onPress={() => setServicesDropdownVisible(!servicesDropdownVisible)}

                  onMouseEnter={() => setServicesDropdownVisible(true)}

                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}

                >

                  <Text style={[styles.navLink, {

                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary,

                    fontWeight: '400'

                  }]}>Our Services</Text>

                  <Animated.View style={{

                    transform: [{

                      rotate: arrowRotation.interpolate({

                        inputRange: [0, 1],

                        outputRange: ['0deg', '180deg']

                      })

                    }]

                  }}>

                    <FontAwesome name="chevron-down" size={12} color={isUserDarkMode ? darkPalette.secondary : palette.secondary} />

                  </Animated.View>

                </Pressable>

                <View
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
                  onMouseEnter={() => setServicesDropdownVisible(true)}
                  onMouseLeave={() => setServicesDropdownVisible(false)}
                  pointerEvents="box-none"
                />

                <Animated.View

                  style={[

                    styles.servicesDropdown,

                    {

                      backgroundColor: isUserDarkMode ? darkPalette.surface : palette.surface,

                      borderColor: isUserDarkMode ? '#333' : 'rgba(27, 28, 28, 0.1)',

                      opacity: dropdownAnim,

                      transform: [

                        {

                          translateY: dropdownAnim.interpolate({

                            inputRange: [0, 1],

                            outputRange: [-10, 0]

                          })

                        }

                      ],

                      pointerEvents: servicesDropdownVisible ? 'auto' : 'none'

                    }

                  ]}

                  onMouseEnter={() => setServicesDropdownVisible(true)}

                  onMouseLeave={() => setServicesDropdownVisible(false)}

                >

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setServicesDropdownVisible(false); setCurrentPage('services'); }}
                    onMouseEnter={() => setServicesDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Functional Medicine</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setServicesDropdownVisible(false); setCurrentPage('services'); }}
                    onMouseEnter={() => setServicesDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Metabolic Health</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setServicesDropdownVisible(false); setCurrentPage('services'); }}
                    onMouseEnter={() => setServicesDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Chronic Disease Management</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setServicesDropdownVisible(false); setCurrentPage('services'); }}
                    onMouseEnter={() => setServicesDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Nutrition & Lifestyle Coaching</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setServicesDropdownVisible(false); setCurrentPage('services'); }}
                    onMouseEnter={() => setServicesDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Diagnostics & Lab Services</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setServicesDropdownVisible(false); setCurrentPage('services'); }}
                    onMouseEnter={() => setServicesDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Pharmacy</Text>

                  </Pressable>

                </Animated.View>

              </View>

              <View 
                style={{ position: 'relative' }}
              >

                <Pressable

                  onPress={() => setAboutDropdownVisible(!aboutDropdownVisible)}

                  onMouseEnter={() => setAboutDropdownVisible(true)}

                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}

                >

                  <Text style={[styles.navLink, {

                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary,

                    fontWeight: '400'

                  }]}>About</Text>

                  <Animated.View style={{

                    transform: [{

                      rotate: aboutArrowRotation.interpolate({

                        inputRange: [0, 1],

                        outputRange: ['0deg', '180deg']

                      })

                    }]

                  }}>

                    <FontAwesome name="chevron-down" size={12} color={isUserDarkMode ? darkPalette.secondary : palette.secondary} />

                  </Animated.View>

                </Pressable>

                <View
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
                  onMouseEnter={() => setAboutDropdownVisible(true)}
                  onMouseLeave={() => setAboutDropdownVisible(false)}
                  pointerEvents="box-none"
                />

                <Animated.View

                  style={[

                    styles.servicesDropdown,

                    {

                      backgroundColor: isUserDarkMode ? darkPalette.surface : palette.surface,

                      borderColor: isUserDarkMode ? '#333' : 'rgba(27, 28, 28, 0.1)',

                      opacity: aboutDropdownAnim,

                      transform: [

                        {

                          translateY: aboutDropdownAnim.interpolate({

                            inputRange: [0, 1],

                            outputRange: [-10, 0]

                          })

                        }

                      ],

                      pointerEvents: aboutDropdownVisible ? 'auto' : 'none'

                    }

                  ]}

                  onMouseEnter={() => setAboutDropdownVisible(true)}

                  onMouseLeave={() => setAboutDropdownVisible(false)}

                >

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setAboutDropdownVisible(false); setCurrentPage('about'); }}
                    onMouseEnter={() => setAboutDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Our Story</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setAboutDropdownVisible(false); setCurrentPage('about'); }}
                    onMouseEnter={() => setAboutDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Our Team</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setAboutDropdownVisible(false); setCurrentPage('about'); }}
                    onMouseEnter={() => setAboutDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Patient Stories</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setAboutDropdownVisible(false); setCurrentPage('about'); }}
                    onMouseEnter={() => setAboutDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Blog & News</Text>

                  </Pressable>

                  <Pressable 
                    style={styles.dropdownItem} 
                    onPress={() => { setAboutDropdownVisible(false); setCurrentPage('about'); }}
                    onMouseEnter={() => setAboutDropdownVisible(true)}
                  >

                    <Text style={styles.dropdownItemText}>• Vision & Mission</Text>

                  </Pressable>

                </Animated.View>

              </View>

              <Pressable onPress={() => setCurrentPage('blogs')}>

                <Text style={[styles.navLink, {

                  color: currentPage === 'blogs' ? (isUserDarkMode ? darkPalette.oxblood : palette.oxblood) : (isUserDarkMode ? darkPalette.secondary : palette.secondary),

                  fontWeight: currentPage === 'blogs' ? '700' : '400'

                }]}>Blogs</Text>

              </Pressable>

              <Pressable onPress={() => setCurrentPage('contact')}>

                <Text style={[styles.navLink, {

                  color: currentPage === 'contact' ? (isUserDarkMode ? darkPalette.oxblood : palette.oxblood) : (isUserDarkMode ? darkPalette.secondary : palette.secondary),

                  fontWeight: currentPage === 'contact' ? '700' : '400'

                }]}>Contact</Text>

              </Pressable>

            </View>



            <View style={styles.headerRight}>

              {!isShopPage && (
                <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 10000, marginRight: 8 }}>
                  {shareButtonEl}

                  {!isCompactShareMenu && (
                    <Animated.View
                      pointerEvents={isShareMenuOpen ? 'auto' : 'none'}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        paddingLeft: 8,
                        gap: 8,
                        opacity: shareMenuAnim,
                        transform: [{
                          translateX: shareMenuAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0]
                          })
                        }],
                        overflow: 'hidden',
                        maxWidth: shareMenuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 420]
                        })
                      }}
                    >
                      {shareIconEls}
                    </Animated.View>
                  )}
                </View>
              )}

              {isShopPage && (

                <View style={styles.headerActions}>

                  <Pressable

                    style={[styles.currencyBtn, {

                      borderColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood,

                      backgroundColor: isUserDarkMode ? darkPalette.background : '#fff'

                    }]}

                    onPress={() => setCurrency((prev) => currencyOptions[(currencyOptions.indexOf(prev) + 1) % currencyOptions.length])}

                  >

                    <Text style={[styles.currencyBtnText, {

                      color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

                    }]}>{currency}</Text>

                  </Pressable>

                  <Pressable style={styles.badgeWrap} onPress={openCart}>

                    <Text style={[styles.headerIcon, { color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood }]}>bag</Text>

                    <View style={styles.badge}>

                      <Text style={styles.badgeText}>{cartCount}</Text>

                    </View>

                  </Pressable>

                </View>

              )}

            </View>

          </>

        )}

      </View>

      {isCompactShareMenu && isShareMenuOpen && (
        <Animated.View
          pointerEvents="auto"
          style={{
            position: 'absolute',
            top: 68,
            right: isPhoneScreen ? 12 : 20,
            zIndex: 10002,
            maxWidth: Math.min(width - 24, isPhoneScreen ? 220 : 248),
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 10,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 28,
            backgroundColor: isUserDarkMode ? darkPalette.surface : '#ffffff',
            borderWidth: 1,
            borderColor: isUserDarkMode ? '#333' : 'rgba(27, 28, 28, 0.08)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 16,
            opacity: shareMenuAnim,
            transform: [
              {
                translateY: shareMenuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
          }}
        >
          {shareIconEls}
        </Animated.View>
      )}

      {/* Mobile Menu */}

      <Modal

        visible={mobileMenuVisible}

        transparent={true}

        animationType="slide"

        onRequestClose={() => setMobileMenuVisible(false)}

      >

        <Pressable style={styles.mobileMenuBackdrop} onPress={() => setMobileMenuVisible(false)}>

          <Animated.View

            style={[

              styles.mobileMenuDrawer,

              {

                transform: [

                  {

                    translateX: mobileMenuAnim.interpolate({

                      inputRange: [0, 1],

                      outputRange: [-300, 0]

                    })

                  }

                ]

              }

            ]}

            onStartShouldSetResponder={() => true}

          >

            <View style={styles.mobileMenuHeader}>

              <Text style={styles.mobileMenuTitle}>Menu</Text>

              <Pressable style={styles.mobileMenuClose} onPress={() => setMobileMenuVisible(false)}>

                <FontAwesome name="times" size={24} color={isUserDarkMode ? darkPalette.charcoal : palette.charcoal} />

              </Pressable>

            </View>



            <ScrollView style={styles.mobileMenuContent}>

              <Pressable style={styles.mobileMenuItem} onPress={() => { setCurrentPage('home'); setMobileMenuVisible(false); }}>

                <Text style={[styles.mobileMenuItemText, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Home</Text>

              </Pressable>

              <Pressable style={styles.mobileMenuItem} onPress={() => { setCurrentPage('shop'); setMobileMenuVisible(false); }}>

                <Text style={[styles.mobileMenuItemText, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Shop</Text>

              </Pressable>



              <Pressable

                style={styles.mobileMenuItem}

                onPress={() => setMobileServicesExpanded(!mobileServicesExpanded)}

              >

                <View style={styles.mobileMenuItemRow}>

                  <Text style={[styles.mobileMenuItemText, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Our Services</Text>

                  <FontAwesome name={mobileServicesExpanded ? "chevron-up" : "chevron-down"} size={16} color={isUserDarkMode ? darkPalette.secondary : palette.secondary} />

                </View>

              </Pressable>

              {mobileServicesExpanded && (

                <View style={styles.mobileSubmenu}>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('services'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Functional Medicine</Text>

                  </Pressable>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('services'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Metabolic Health</Text>

                  </Pressable>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('services'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Chronic Disease Management</Text>

                  </Pressable>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('services'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Nutrition & Lifestyle Coaching</Text>

                  </Pressable>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('services'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Diagnostics & Lab Services</Text>

                  </Pressable>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('services'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Pharmacy</Text>

                  </Pressable>

                </View>

              )}



              <Pressable

                style={styles.mobileMenuItem}

                onPress={() => setMobileAboutExpanded(!mobileAboutExpanded)}

              >

                <View style={styles.mobileMenuItemRow}>

                  <Text style={[styles.mobileMenuItemText, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>About</Text>

                  <FontAwesome name={mobileAboutExpanded ? "chevron-up" : "chevron-down"} size={16} color={isUserDarkMode ? darkPalette.secondary : palette.secondary} />

                </View>

              </Pressable>

              {mobileAboutExpanded && (

                <View style={styles.mobileSubmenu}>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('about'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Our Story</Text>

                  </Pressable>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('about'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Our Team</Text>

                  </Pressable>

                  <Pressable style={styles.mobileSubmenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('about'); }}>

                    <Text style={[styles.mobileSubmenuItemText, { color: '#28A745' }]}>• Patient Story</Text>

                  </Pressable>

                </View>

              )}



              <Pressable style={styles.mobileMenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('blogs'); }}>

                <Text style={[styles.mobileMenuItemText, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Blogs</Text>

              </Pressable>

              <Pressable style={styles.mobileMenuItem} onPress={() => { setMobileMenuVisible(false); setCurrentPage('contact'); }}>

                <Text style={[styles.mobileMenuItemText, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Contact</Text>

              </Pressable>



              <View style={[styles.mobileSocialIcons, { flexWrap: 'wrap', gap: 14 }]}>

                {SOCIAL_BADGES.map((badge) => {
                  const shareUrl = getShareUrl(badge);
                  
                  return (
                    <AnimatedSocialIconBadge
                      key={badge.iconName + badge.url}
                      onPress={() => Linking.openURL(shareUrl)}
                      backgroundColor={badge.backgroundColor}
                      iconName={badge.iconName}
                      iconSize={18}
                      size={40}
                      style={{ marginRight: 0 }}
                    />
                  );
                })}

              </View>

            </ScrollView>

          </Animated.View>

        </Pressable>

      </Modal>



      {isAccountPage ? (

        <ScrollView style={styles.cartPageLayout} contentContainerStyle={{padding: 20}} bounces={false}>

          <View style={{marginBottom: 20}}>

            <Text style={{fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', color: palette.oxblood}}>My Account</Text>

            <Text style={{color: palette.secondary, marginTop: 4}}>Welcome back, {user?.user_metadata?.full_name || 'Guest'}!</Text>

          </View>

          

          <View style={{backgroundColor: palette.background, borderWidth: 1, borderColor: palette.oxblood, padding: 20, marginBottom: 20}}>

            <Text style={{fontFamily: 'Georgia', fontSize: 18, fontWeight: '700', color: palette.oxblood, marginBottom: 16}}>Order History</Text>

            {customerOrdersLoading ? (

              <Text style={{color: palette.secondary}}>Loading orders...</Text>

            ) : customerOrders.length > 0 ? (

              customerOrders.map(order => (

                <View key={order.id} style={{flexDirection: 'column', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)'}}>

                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8}}>

                    <View style={{flex: 1}}>

                      <Text style={{fontWeight: '700', color: palette.charcoal, fontSize: 11}} numberOfLines={1} ellipsizeMode="tail">

                        Order #{String(order.id).slice(0, 8).toUpperCase()}...

                      </Text>

                      <Text style={{fontSize: 11, color: palette.secondary, marginTop: 2}}>{new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>

                    </View>

                    <View style={{alignItems: 'flex-end', flexShrink: 0}}>

                      <Text style={{fontWeight: '700', color: palette.oxblood}}>{formatCurrency(order.total)}</Text>

                      <View style={{backgroundColor: order.status === 'Pending' ? '#FDE68A' : order.status === 'Processing' ? '#93C5FD' : order.status === 'Delivered' ? '#86EFAC' : '#E5E7EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4}}>

                        <Text style={{fontSize: 10, fontWeight: '700', color: '#1F2937'}}>{String(order.status).toUpperCase()}</Text>

                      </View>

                    </View>

                  </View>

                  

                  {order.order_items && order.order_items.length > 0 && (

                    <View style={{marginTop: 12}}>

                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 12}}>

                        {order.order_items.map((item, idx) => {

                          const product = productCards.find(p => p.id === item.product_id);

                          const imageUrl = product ? product.image : 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=200&q=80';

                          return (

                            <View key={idx} style={{alignItems: 'center', width: 44}}>

                              <Image source={{uri: imageUrl}} style={{width: 44, height: 44, borderRadius: 22, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'}} />

                              <Text style={{fontSize: 10, color: palette.secondary, marginTop: 4, fontWeight: '700'}}>{item.quantity}x</Text>

                            </View>

                          );

                        })}

                      </ScrollView>

                    </View>

                  )}

                </View>

              ))

            ) : (

              <Text style={{color: palette.secondary}}>You haven't placed any orders yet.</Text>

            )}

          </View>

          

            <Pressable

              style={{backgroundColor: palette.oxblood, padding: 14, alignItems: 'center', marginBottom: 12}}

              onPress={() => setCurrentPage('shop')}

              accessibilityLabel="Back to Shop"

            >

              <Text style={{color: '#fff', fontWeight: '700', letterSpacing: 1}}>

                BACK TO SHOP

              </Text>

            </Pressable>



            <Pressable

              style={{borderWidth: 1, borderColor: palette.oxblood, padding: 14, alignItems: 'center'}}

              onPress={handleLogout}

              accessibilityLabel="Sign Out"

            >

              <Text style={{color: palette.oxblood, fontWeight: '700', letterSpacing: 1}}>

                SIGN OUT

              </Text>

            </Pressable>

        </ScrollView>

      ) : isAdminLoginPage ? (

        <ScrollView contentContainerStyle={{ flex: 1, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center', padding: 24, minHeight: 500 }} showsVerticalScrollIndicator={false} bounces={false}>

          <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#fff', borderTopWidth: 4, borderTopColor: palette.oxblood, padding: 36, shadowColor: '#000', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.08, shadowRadius: 24 }}>



            {/* Logo / Brand */}

            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 3, color: palette.oxblood, marginBottom: 8 }}>Prolyn Wear</Text>

            <Text style={{ fontFamily: 'Georgia', fontSize: 28, fontWeight: '700', color: palette.charcoal, marginBottom: 4 }}>Admin Login</Text>

            <Text style={{ fontSize: 13, color: palette.secondary, marginBottom: 32, lineHeight: 20 }}>Sign in with your admin account to access the dashboard.</Text>



            {/* Email */}

            <View style={{ marginBottom: 16 }}>

              <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 1, marginBottom: 6 }}>EMAIL ADDRESS</Text>

              <TextInput

                value={authEmail}

                onChangeText={setAuthEmail}

                autoCapitalize="none"

                keyboardType="email-address"

                placeholder="admin@example.com"

                placeholderTextColor="#C4A89C"

                style={{ borderWidth: 1, borderColor: 'rgba(74,4,4,0.2)', backgroundColor: '#FAFAFA', padding: 14, fontSize: 14, color: palette.charcoal }}

              />

            </View>



            {/* Password */}

            <View style={{ marginBottom: 28 }}>

              <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 1, marginBottom: 6 }}>PASSWORD</Text>

              <TextInput

                value={authPassword}

                onChangeText={setAuthPassword}

                secureTextEntry={true}

                placeholder="••••••••"

                placeholderTextColor="#C4A89C"

                style={{ borderWidth: 1, borderColor: 'rgba(74,4,4,0.2)', backgroundColor: '#FAFAFA', padding: 14, fontSize: 14, color: palette.charcoal }}

              />

            </View>



            {/* Sign In Button */}

            <Pressable

              onPress={() => { setIsLoginMode(true); handleLogin(); }}

              style={({ pressed }) => [{ backgroundColor: pressed ? '#3a0303' : palette.oxblood, paddingVertical: 16, alignItems: 'center', marginBottom: 14 }]}

            >

              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 2 }}>SIGN IN</Text>

            </Pressable>



            {/* Back to Shop */}

            <Pressable onPress={() => setCurrentPage('shop')} style={{ alignItems: 'center', paddingVertical: 12 }}>

              <Text style={{ fontSize: 12, fontWeight: '700', color: palette.oxblood, letterSpacing: 1 }}>← BACK TO SHOP</Text>

            </Pressable>



          </View>

        </ScrollView>

      ) : isAdminPage ? (

        <View style={[styles.adminDashboardLayout, { backgroundColor: adm.bg }]}>

          {/* SIDEBAR — hidden on mobile, shown on desktop */}

          <View style={[styles.adminSidebar, isCompactAdmin && { display: 'none' }]}>

            <Text style={styles.adminSidebarBrand}>Prolyn Wear</Text>

            

            <View style={styles.adminProfileBlock}>

              <Pressable onPress={() => { setTempAvatarUrl(adminAvatarUrl); setAdminProfileModalVisible(true); }}>

                <Image source={{ uri: adminAvatarUrl }} style={styles.adminAvatar} />

                <View style={{position: 'absolute', bottom: -2, right: -2, backgroundColor: '#4A0404', borderRadius: 12, width: 20, height: 20, alignItems: 'center', justifyContent: 'center'}}>

                  <FontAwesome name="pencil" size={10} color="#fff" />

                </View>

              </Pressable>

              <View style={styles.adminProfileInfo}>

                <Text style={styles.adminProfileName}>Administrator</Text>

                <Text style={styles.adminProfileRole}>ADMIN ACCESS</Text>

              </View>

            </View>



            <ScrollView

              style={{ flex: 1 }}

              showsVerticalScrollIndicator={true}

              contentContainerStyle={{ paddingBottom: 60 }}

            >

              {/* Main nav items */}

              <View style={styles.adminNavList}>

                {['Dashboard', 'Inventory', 'Orders', 'Customers', 'Analytics', 'Riders'].map((item) => (

                  <Pressable

                    key={item}

                    onPress={() => setActiveAdminTab(item)}

                    style={[styles.adminNavItem, activeAdminTab === item && styles.adminNavItemActive]}

                  >

                    <Text style={[styles.adminNavText, activeAdminTab === item && styles.adminNavTextActive]}>{item}</Text>

                  </Pressable>

                ))}

              </View>



              {/* Divider */}

              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8, marginHorizontal: 16 }} />



              {/* Bottom nav items — Settings & Price Update */}

              <View style={styles.adminNavListBottom}>

                {['Settings', 'Price Update'].map((item) => (

                  <Pressable

                    key={item}

                    onPress={() => setActiveAdminTab(item)}

                    style={[styles.adminNavItem, activeAdminTab === item && styles.adminNavItemActive]}

                  >

                    <Text style={[styles.adminNavText, activeAdminTab === item && styles.adminNavTextActive]}>{item}</Text>

                  </Pressable>

                ))}

              </View>

            </ScrollView>

          </View>



          {/* MAIN CONTENT */}

          <ScrollView style={[styles.adminMainContent, { backgroundColor: adm.bg }]} contentContainerStyle={styles.adminMainScroll} showsVerticalScrollIndicator={true} bounces={false}>

            <View style={[styles.adminTopHeader, { borderBottomColor: adm.border }]}>

              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>

                {/* Hamburger — mobile only */}

                {isCompactAdmin && (

                  <Pressable

                    onPress={openAdminDrawer}

                    style={{

                      width: 36, height: 36,

                      justifyContent: 'center', alignItems: 'center',

                      backgroundColor: '#F5F5F5',

                      borderRadius: 6,

                    }}

                    accessibilityLabel="Open navigation menu"

                  >

                    <FontAwesome name="bars" size={18} color="#4A0404" />

                  </Pressable>

                )}

                <Text style={[styles.adminMainTitle, { color: adm.text }]}>{activeAdminTab}</Text>

              </View>

              <View style={styles.adminTopIcons}>

                <Pressable onPress={() => {

                  setAdminUnlocked(false);

                  setCurrentPage('shop');

                }} style={{ marginRight: 16 }}>

                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#5F5E5F' }}>LOGOUT</Text>

                </Pressable>

              </View>

            </View>



            {/* CURRENCY TOGGLE */}

            {(activeAdminTab === 'Dashboard' || activeAdminTab === 'Analytics') && (

            <View style={styles.adminCurrencySection}>

              <Text style={styles.adminSectionSubTitle}>CURRENCY</Text>

              <View style={styles.adminCurrencyToggleRow}>

                {currencyOptions.map((option) => {

                  const active = option === currency;

                  return (

                    <Pressable

                      key={option}

                      onPress={() => setCurrency(option)}

                      style={[styles.adminCurrencyToggle, active && styles.adminCurrencyToggleActive, isCompactAdmin && { paddingHorizontal: 12, paddingVertical: 6 }]}

                    >

                      <Text style={[styles.adminCurrencyToggleText, active && styles.adminCurrencyToggleTextActive]}>{option}</Text>

                    </Pressable>

                  );

                })}

              </View>

            </View>

            )}



            {/* STATS */}

            {(activeAdminTab === 'Dashboard' || activeAdminTab === 'Analytics') && (

            <View style={styles.adminStatCardsRow}>

              <View style={[styles.adminNewStatCard, { backgroundColor: adm.surface, borderColor: adm.border }]}>

                <View style={styles.adminNewStatCardHeader}>

                  <Text style={styles.adminNewStatLabel}>REVENUE</Text>

                  <View style={analyticsData.revStyle.bg}><Text style={analyticsData.revStyle.text}>{analyticsData.revGrowthStr}</Text></View>

                </View>

                <Text style={styles.adminNewStatValue}>{formatCurrency(adminOrders.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0))}</Text>

                <View style={styles.adminStatLine} />

              </View>

              

              <View style={[styles.adminNewStatCard, { backgroundColor: adm.surface, borderColor: adm.border }]}>

                <View style={styles.adminNewStatCardHeader}>

                  <Text style={styles.adminNewStatLabel}>TOTAL ORDERS</Text>

                  <View style={analyticsData.orderStyle.bg}><Text style={analyticsData.orderStyle.text}>{analyticsData.orderGrowthStr}</Text></View>

                </View>

                <Text style={styles.adminNewStatValue}>{adminOrders.length}</Text>

                <Text style={styles.adminNewStatSub}>Lifetime orders</Text>

              </View>

              

              <View style={[styles.adminNewStatCard, styles.adminNewStatCardDark]}>

                <View style={styles.adminNewStatCardHeader}>

                  <Text style={[styles.adminNewStatLabel, {color: '#fff'}]}>ACTIVE SHIPMENTS</Text>

                </View>

                <Text style={[styles.adminNewStatValue, {color: '#fff'}]}>{adminOrders.filter(o => ['processing', 'delivery'].includes(String(o.status).toLowerCase())).length}</Text>

                <Text style={[styles.adminNewStatSub, {color: '#FF9999'}]}>{adminOrders.filter(o => String(o.status).toLowerCase() === 'delivery').length} delivering today</Text>

                <Text style={styles.adminDarkCardIcon}>🚚</Text>

              </View>

            </View>

            )}



            {/* INVENTORY TABLE */}

            {(activeAdminTab === 'Dashboard' || activeAdminTab === 'Inventory') && (

            <View style={styles.adminDashboardSection}>

              <View style={styles.adminDashboardSectionHeader}>

                <Text style={[styles.adminMainSubtitle, { color: adm.text }]}>Inventory Management</Text>

                <Pressable style={styles.adminDarkButton} onPress={() => setAddProductModalVisible(true)}>

                  <Text style={styles.adminDarkButtonText}>Add New Product</Text>

                </Pressable>

              </View>



              <View style={[styles.adminNewTable, { backgroundColor: adm.surface, borderColor: adm.border }]}>

                <View style={[styles.adminNewTableHeader, { backgroundColor: adm.tableHead, borderBottomColor: adm.border }, isCompactAdmin && { display: 'none' }]}>

                  <Text style={[styles.adminNewTableCol, {flex: 3}]}>PRODUCT</Text>

                  <Text style={[styles.adminNewTableCol, {flex: 1}]}>CURRENT STOCK</Text>

                  <Text style={[styles.adminNewTableCol, {flex: 1}]}>STATUS</Text>

                  <Text style={[styles.adminNewTableCol, {flex: 0.5, textAlign: 'right'}]}>ACTION</Text>

                </View>

                

                {productCards.slice(0, activeAdminTab === 'Dashboard' ? 5 : undefined).map((product, idx) => {

                  const stockValue = Number(product.stock_quantity) || 0;

                  const isLow = stockValue < 15;

                  return (

                    <View key={product.id} style={[styles.adminNewTableRow, { borderBottomColor: adm.border }, isCompactAdmin && { flexDirection: 'column', alignItems: 'flex-start', gap: 10 }]}>

                      <View style={[{flex: 3, flexDirection: 'row', alignItems: 'center', gap: 12}, isCompactAdmin && { width: '100%' }]}>

                        <Image source={{uri: product.image}} style={styles.adminNewTableImage} />

                        <Text style={[styles.adminNewTableTitle, { color: adm.text }]}>{product.name}</Text>

                      </View>



                      {!isCompactAdmin && (

                        <>

                          <View style={{flex: 1, justifyContent: 'center'}}>

                            <Text style={[styles.adminNewTableText, { color: adm.sub }]}>{stockValue}kg</Text>

                          </View>

                          <View style={{flex: 1, justifyContent: 'center'}}>

                            <View style={isLow ? styles.adminStatusBadgeRed : styles.adminStatusBadgeGreen}>

                              <Text style={isLow ? styles.adminStatusBadgeRedText : styles.adminStatusBadgeGreenText}>

                                {isLow ? 'Low Stock' : 'In Stock'}

                              </Text>

                            </View>

                          </View>

                        </>

                      )}



                      <View style={[{flex: 0.5, alignItems: 'flex-end', justifyContent: 'center'}, isCompactAdmin && { position: 'absolute', right: 20, top: 28 }]}>

                        <Pressable onPress={() => {

                          setEditingProduct({

                            id: product.id,

                            name: product.name,

                            price_s: String(product.price_s ?? '0'),

                            price_m: String(product.price_m ?? '0'),

                            price_l: String(product.price_l ?? '0'),

                            price_xl: String(product.price_xl ?? '0'),

                            price_xxl: String(product.price_xxl ?? '0'),

                            price: String(product.price ?? ''),

                            hasSizes: product.hasSizes ?? product.hasWeights ?? true,

                            hasWeights: product.hasSizes ?? product.hasWeights ?? true,

                            tag: product.tag || '',

                            categoryLabel: product.categoryLabel || '',

                            description: product.description || '',

                            image: product.image || '',

                            stock_quantity: String(product.stock_quantity || '0'),

                          });

                          setEditProductModalVisible(true);

                        }}>

                          <Text style={styles.adminEditIcon}>✎</Text>

                        </Pressable>

                      </View>

                    </View>

                  );

                })}

              </View>

            </View>

            )}



            {/* RECENT ORDERS */}

            {(activeAdminTab === 'Dashboard' || activeAdminTab === 'Orders') && (

            <View style={styles.adminDashboardSection}>

              <Text style={[styles.adminMainSubtitle, { color: adm.text }]}>{activeAdminTab === 'Orders' ? 'All Orders' : 'Recent Orders'}</Text>

              <View style={styles.adminOrdersList}>

                {(adminOrders.length > 0 ? (activeAdminTab === 'Dashboard' ? adminOrders.slice(0, 3) : adminOrders) : [

                  {id: '#MC-84920', status: 'PROCESSING', metadata: { customer_name: 'A. Thompson', customer_phone: '+233241234567' }, order_items: [1,2], total: 84.50},

                  {id: '#MC-84919', status: 'DELIVERY', metadata: { customer_name: 'J. Richards', customer_phone: '+233209876543' }, order_items: [1,2,3,4,5], total: 212.00},

                  {id: '#MC-84918', status: 'PROCESSING', metadata: { customer_name: 'L. Sterling', customer_phone: '+233551112233' }, order_items: [1], total: 45.99},

                ]).map(order => (

                  <View key={order.id} style={[styles.adminNewOrderCard, {flexDirection: 'column', gap: 10}]}>

                    {/* Order ID row with status badge on the right */}

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

                      <Text style={[styles.adminOrderCardId, { color: adm.sub }]}>{String(order.id).slice(0, 14)}</Text>

                      {/* Status badge — tap to cycle */}

                      <Pressable

                        onPress={() => {

                          const statuses = ['Pending', 'Processing', 'Delivery', 'Delivered'];

                          const currentIdx = statuses.findIndex(s => String(order.status).toLowerCase() === s.toLowerCase());

                          const nextStatus = statuses[(currentIdx + 1) % statuses.length];

                          updateOrderStatus(order.id, nextStatus);

                        }}

                        style={[

                          styles.adminOrderCardStatusBadge,

                          { backgroundColor: String(order.status).toLowerCase() === 'pending' ? '#FFF3CD' :

                                            String(order.status).toLowerCase() === 'processing' ? '#CCE5FF' :

                                            String(order.status).toLowerCase() === 'delivery' ? '#D4EDDA' :

                                            String(order.status).toLowerCase() === 'delivered' ? '#A855F7' : '#F3F4F6' }

                        ]}

                      >

                        <Text style={[

                          styles.adminOrderCardStatusText,

                          { color: String(order.status).toLowerCase() === 'pending' ? '#856404' :

                                   String(order.status).toLowerCase() === 'processing' ? '#004085' :

                                   String(order.status).toLowerCase() === 'delivery' ? '#155724' :

                                   String(order.status).toLowerCase() === 'delivered' ? '#FFFFFF' : '#6B7280' }

                        ]}>{String(order.status).toUpperCase()}</Text>

                      </Pressable>

                    </View>



                    {/* Customer name + icons */}

                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>

                      <Text style={[styles.adminOrderCardUser, { color: adm.text }]}>{order.metadata?.customer_name || 'Guest'}</Text>

                      <Pressable onPress={() => {

                        const phone = order.metadata?.customer_phone || '+233240000000';

                        let waPhone = phone.replace(/[^0-9]/g, '');

                        if (waPhone.startsWith('0')) waPhone = '233' + waPhone.substring(1);

                        Linking.openURL(`https://wa.me/${waPhone}`);

                      }}>

                        <FontAwesome name="whatsapp" size={16} color="#10B981" />

                      </Pressable>

                      <Pressable onPress={() => deleteOrder(order.id)}>

                        <FontAwesome name="trash-o" size={16} color="#D26A5F" />

                      </Pressable>

                    </View>



                    {/* Items + address on left, amount on right */}

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

                      <Text style={[styles.adminOrderCardMeta, { color: adm.sub }]}>

                        {(order.order_items?.length || 1)} Item{(order.order_items?.length !== 1) ? 's' : ''}

                        {order.metadata?.delivery_address ? ` • ${String(order.metadata.delivery_address).slice(0, 25)}…` : ' • Pickup'}

                      </Text>

                      <Text style={styles.adminOrderCardAmount}>{formatCurrency(order.total || 0)}</Text>

                    </View>



                    {/* Send to Rider button — opens Rider Picker */}

                    <Pressable

                      onPress={() => {

                        setRiderPickerOrder({

                          id: order.id,

                          customer_name: order.metadata?.customer_name || 'Customer',

                          customer_phone: order.metadata?.customer_phone || '',

                          customer_email: order.metadata?.customer_email || '',

                          total: order.total || 0,

                          payment_method: 'Cash on Delivery',

                          order_items: (order.order_items || []).map(item => ({

                            product_name: item.product_name || item.products?.name || 'Product',

                            quantity: item.quantity || 1,

                          })),

                        });

                        setRiderPickerDelivery({

                          address: order.metadata?.delivery_address || 'Address not provided',

                          latitude: order.metadata?.latitude || null,

                          longitude: order.metadata?.longitude || null,

                          distance: order.metadata?.distance || null,

                          estimatedTime: order.metadata?.estimated_time || null,

                        });

                        setRiderPickerVisible(true);

                      }}

                      style={{

                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',

                        backgroundColor: '#25D366', borderRadius: 8,

                        paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 10,

                      }}

                    >

                      <FontAwesome name="motorcycle" size={15} color="#fff" />

                      <Text style={{color: '#fff', fontWeight: '700', fontSize: 13}}>Send to Rider</Text>

                    </Pressable>

                  </View>

                ))}

              </View>

              {activeAdminTab === 'Dashboard' && (

                <Pressable style={styles.adminOutlineButton} onPress={() => setActiveAdminTab('Orders')}>

                  <Text style={styles.adminOutlineButtonText}>View All Orders</Text>

                </Pressable>

              )}

            </View>

            )}



            {/* CUSTOMERS CRM */}

            {(activeAdminTab === 'Customers') && (

            <View style={styles.adminDashboardSection}>

              {/* Header row */}

              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>

                <Text style={[styles.adminMainSubtitle, { color: adm.text }]}>Customer CRM</Text>

                <View style={{backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12}}>

                  <Text style={{fontSize: 12, fontWeight: '700', color: '#5F5E5F'}}>{uniqueCustomers.length} customers</Text>

                </View>

              </View>



              {/* Search Bar */}

              <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14, gap: 8}}>

                <FontAwesome name="search" size={13} color="#9CA3AF" />

                <TextInput

                  placeholder="Search by name, phone or email..."

                  placeholderTextColor="#9CA3AF"

                  value={customerSearch}

                  onChangeText={setCustomerSearch}

                  style={{flex: 1, fontSize: 13, color: '#1B1C1C', padding: 0}}

                />

                {customerSearch.length > 0 && (

                  <Pressable onPress={() => setCustomerSearch('')}>

                    <FontAwesome name="times-circle" size={14} color="#9CA3AF" />

                  </Pressable>

                )}

              </View>



              {/* Duplicate Warning Banner */}

              {uniqueCustomers.some(c => c.isDuplicate) && (

                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 8, padding: 10, marginBottom: 12}}>

                  <FontAwesome name="exclamation-triangle" size={13} color="#D97706" />

                  <Text style={{fontSize: 12, color: '#92400E', flex: 1}}>

                    Some customers share the same name but have different phone numbers — possible duplicates.

                  </Text>

                </View>

              )}



              {/* Customer Cards */}

              <View style={styles.adminOrdersList}>

                {(() => {

                  const q = customerSearch.trim().toLowerCase();

                  const filtered = uniqueCustomers.filter(c =>

                    !q ||

                    (c.name || '').toLowerCase().includes(q) ||

                    (c.phone || '').includes(q) ||

                    (c.email || '').toLowerCase().includes(q)

                  );



                  if (filtered.length === 0) {

                    return (

                      <View style={{alignItems: 'center', paddingVertical: 40, gap: 8}}>

                        <FontAwesome name="search" size={32} color="#E0E0E0" />

                        <Text style={{color: '#888', fontSize: 13}}>No customers match "{customerSearch}"</Text>

                      </View>

                    );

                  }



                  return filtered.map((customer, idx) => {

                    const isExpanded = expandedCustomerPhone === customer.phone;

                    return (

                      <View key={idx} style={[styles.adminNewOrderCard, {flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden'}]}>



                        {/* Card Header — tap to expand */}

                        <Pressable

                          onPress={() => setExpandedCustomerPhone(isExpanded ? null : customer.phone)}

                          style={{flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12}}

                        >

                          {/* Avatar */}

                          <View style={{width: 44, height: 44, borderRadius: 22, backgroundColor: '#4A0404', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>

                            <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>

                              {(customer.name || 'G').charAt(0).toUpperCase()}

                            </Text>

                          </View>



                          {/* Info */}

                          <View style={{flex: 1}}>

                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap'}}>

                              <Text style={{fontSize: 14, fontWeight: '700', color: '#1B1C1C'}}>{customer.name}</Text>

                              {customer.isDuplicate && (

                                <View style={{backgroundColor: '#FEF9C3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 3}}>

                                  <FontAwesome name="exclamation-triangle" size={9} color="#D97706" />

                                  <Text style={{fontSize: 9, fontWeight: '700', color: '#D97706'}}>POSSIBLE DUPLICATE</Text>

                                </View>

                              )}

                            </View>

                            <Text style={{fontSize: 12, color: '#5F5E5F', marginTop: 2}}>{customer.phone}</Text>

                            <Text style={{fontSize: 11, color: '#9CA3AF', marginTop: 1}}>

                              {customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''} · {customer.email}

                            </Text>

                          </View>



                          {/* Right side */}

                          <View style={{alignItems: 'flex-end', gap: 6}}>

                            <Text style={{fontSize: 14, fontWeight: '700', color: '#4A0404'}}>{formatCurrency(customer.totalSpent)}</Text>

                            <Pressable

                              onPress={(e) => { e.stopPropagation(); setCustomMsgText(''); setCustomerMsgModal(customer); }}

                              style={{backgroundColor: '#25D366', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 5}}

                            >

                              <FontAwesome name="whatsapp" size={13} color="#fff" />

                              <Text style={{color: '#fff', fontWeight: '700', fontSize: 11}}>Message</Text>

                            </Pressable>

                            <FontAwesome name={isExpanded ? 'chevron-up' : 'chevron-down'} size={11} color="#9CA3AF" />

                          </View>

                        </Pressable>



                        {/* Expanded Order History */}

                        {isExpanded && (

                          <View style={{borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FAFAFA'}}>

                            <View style={{paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4}}>

                              <Text style={{fontSize: 11, fontWeight: '700', color: '#5F5E5F', letterSpacing: 0.5}}>ORDER HISTORY</Text>

                            </View>

                            {(customer.orders || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((ord, oi) => (

                              <View key={oi} style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: oi > 0 ? 1 : 0, borderTopColor: '#F0F0F0', gap: 10}}>

                                <View style={{flex: 1}}>

                                  <Text style={{fontSize: 12, fontWeight: '600', color: '#1B1C1C'}}>#{String(ord.id).slice(0, 8).toUpperCase()}</Text>

                                  <Text style={{fontSize: 11, color: '#9CA3AF', marginTop: 2}}>

                                    {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) : 'Unknown date'}

                                  </Text>

                                  {(ord.order_items || []).length > 0 && (

                                    <Text style={{fontSize: 11, color: '#5F5E5F', marginTop: 2}} numberOfLines={1}>

                                      {(ord.order_items || []).map(it => `${it.product_name || it.products?.name || 'Item'} x${it.quantity || 1}`).join(', ')}

                                    </Text>

                                  )}

                                </View>

                                <View style={{alignItems: 'flex-end', gap: 4}}>

                                  <Text style={{fontSize: 13, fontWeight: '700', color: '#1B1C1C'}}>{formatCurrency(ord.total || 0)}</Text>

                                  <View style={{

                                    backgroundColor:

                                      ord.status === 'DELIVERED' ? '#ECFDF5' :

                                      ord.status === 'Delivery' ? '#EFF6FF' :

                                      ord.status === 'PROCESSING' ? '#FEF9C3' : '#F3F4F6',

                                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,

                                  }}>

                                    <Text style={{

                                      fontSize: 9, fontWeight: '700', letterSpacing: 0.5,

                                      color:

                                        ord.status === 'DELIVERED' ? '#10B981' :

                                        ord.status === 'Delivery' ? '#3B82F6' :

                                        ord.status === 'PROCESSING' ? '#D97706' : '#6B7280',

                                    }}>{ord.status || 'PENDING'}</Text>

                                  </View>

                                </View>

                              </View>

                            ))}

                          </View>

                        )}

                      </View>

                    );

                  });

                })()}

              </View>

            </View>

            )}



            {/* RIDERS TAB */}

            {activeAdminTab === 'Riders' && (

            <View style={styles.adminDashboardSection}>

              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>

                <Text style={[styles.adminMainSubtitle, { color: adm.text }]}>Delivery Riders</Text>

                <Pressable

                  onPress={() => setShowAddRiderForm(prev => !prev)}

                  style={{

                    backgroundColor: showAddRiderForm ? '#E5E7EB' : '#4A0404',

                    paddingHorizontal: 16, paddingVertical: 10,

                    borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 8,

                  }}

                >

                  <FontAwesome name={showAddRiderForm ? 'times' : 'plus'} size={13} color={showAddRiderForm ? '#1B1C1C' : '#fff'} />

                  <Text style={{color: showAddRiderForm ? '#1B1C1C' : '#fff', fontWeight: '700', fontSize: 13}}>

                    {showAddRiderForm ? 'Cancel' : 'Add Rider'}

                  </Text>

                </Pressable>

              </View>



              {showAddRiderForm && (

                <View style={[styles.adminNewOrderCard, {flexDirection: 'column', gap: 12, marginBottom: 20}]}>

                  <Text style={{fontSize: 12, fontWeight: '700', color: '#1B1C1C', letterSpacing: 0.5}}>NEW RIDER</Text>

                  <TextInput

                    placeholder="Full Name"

                    placeholderTextColor="#999"

                    value={newRiderName}

                    onChangeText={setNewRiderName}

                    style={{borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, padding: 10, fontSize: 14, color: '#1B1C1C', backgroundColor: '#FAFAFA'}}

                  />

                  <TextInput

                    placeholder="WhatsApp Number (e.g. +233241234567)"

                    placeholderTextColor="#999"

                    value={newRiderPhone}

                    onChangeText={setNewRiderPhone}

                    keyboardType="phone-pad"

                    style={{borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, padding: 10, fontSize: 14, color: '#1B1C1C', backgroundColor: '#FAFAFA'}}

                  />

                  <TextInput

                    placeholder="Notes (optional)"

                    placeholderTextColor="#999"

                    value={newRiderNotes}

                    onChangeText={setNewRiderNotes}

                    style={{borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, padding: 10, fontSize: 14, color: '#1B1C1C', backgroundColor: '#FAFAFA'}}

                  />

                  <Pressable

                    onPress={addRider}

                    disabled={addRiderLoading}

                    style={{backgroundColor: addRiderLoading ? '#ccc' : '#25D366', padding: 13, borderRadius: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8}}

                  >

                    <FontAwesome name="user-plus" size={14} color="#fff" />

                    <Text style={{color: '#fff', fontWeight: '700', fontSize: 13}}>

                      {addRiderLoading ? 'Saving...' : 'Save Rider'}

                    </Text>

                  </Pressable>

                </View>

              )}



              {ridersLoading ? (

                <ActivityIndicator size="large" color="#4A0404" style={{marginVertical: 40}} />

              ) : riders.length === 0 ? (

                <View style={[styles.adminNewOrderCard, {flexDirection: 'column', alignItems: 'center', paddingVertical: 48, gap: 12}]}>

                  <FontAwesome name="motorcycle" size={48} color="#E0E0E0" />

                  <Text style={{fontSize: 16, fontWeight: '700', color: '#1B1C1C'}}>No Riders Yet</Text>

                  <Text style={{fontSize: 13, color: '#888', textAlign: 'center'}}>

                    Tap "Add Rider" above to add your first delivery rider.

                  </Text>

                  <Pressable onPress={fetchRiders} style={{backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6}}>

                    <Text style={{fontSize: 12, fontWeight: '700', color: '#4A0404'}}>↺ Refresh</Text>

                  </Pressable>

                </View>

              ) : (

                <View style={{gap: 12}}>

                  {riders.map((rider) => (

                    <View key={rider.id} style={[styles.adminNewOrderCard, {flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: rider.is_active ? '#25D366' : '#D1D5DB', gap: 14}]}>

                      <View style={{width: 52, height: 52, borderRadius: 26, backgroundColor: rider.is_active ? '#25D366' : '#D1D5DB', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>

                        <Text style={{color: '#fff', fontWeight: '700', fontSize: 20}}>{rider.name.charAt(0).toUpperCase()}</Text>

                      </View>

                      <View style={{flex: 1}}>

                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>

                          <Text style={{fontSize: 15, fontWeight: '700', color: '#1B1C1C'}}>{rider.name}</Text>

                          <View style={{backgroundColor: rider.is_active ? '#ECFDF5' : '#F3F4F6', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4}}>

                            <Text style={{fontSize: 9, fontWeight: '700', color: rider.is_active ? '#10B981' : '#9CA3AF', letterSpacing: 0.8}}>

                              {rider.is_active ? 'ACTIVE' : 'INACTIVE'}

                            </Text>

                          </View>

                        </View>

                        <Text style={{fontSize: 13, color: '#5F5E5F', marginTop: 3}}>{rider.phone}</Text>

                        {rider.notes ? <Text style={{fontSize: 11, color: '#9CA3AF', marginTop: 2}}>{rider.notes}</Text> : null}

                      </View>

                      <View style={{flexDirection: 'row', gap: 8}}>

                        <Pressable onPress={() => { let w = rider.phone.replace(/[^0-9]/g,''); if(w.startsWith('0')) w='233'+w.substring(1); Linking.openURL(`https://wa.me/${w}`); }} style={{padding: 10, backgroundColor: '#25D366', borderRadius: 8}}>

                          <FontAwesome name="whatsapp" size={18} color="#fff" />

                        </Pressable>

                        <Pressable onPress={() => toggleRiderActive(rider.id, rider.is_active)} style={{padding: 10, borderRadius: 8, backgroundColor: rider.is_active ? '#FEF9C3' : '#ECFDF5'}}>

                          <FontAwesome name={rider.is_active ? 'pause-circle' : 'play-circle'} size={18} color={rider.is_active ? '#D97706' : '#10B981'} />

                        </Pressable>

                        <Pressable onPress={() => { if(typeof window!=='undefined'){if(window.confirm(`Remove ${rider.name}?`))deleteRider(rider.id);}else deleteRider(rider.id); }} style={{padding: 10, backgroundColor: '#FEF2F2', borderRadius: 8}}>

                          <FontAwesome name="trash-o" size={18} color="#EF4444" />

                        </Pressable>

                      </View>

                    </View>

                  ))}

                </View>

              )}

            </View>

            )}



            {/* SETTINGS TAB */}

            {activeAdminTab === 'Settings' && (

            <View style={styles.adminDashboardSection}>

              <Text style={[styles.adminMainSubtitle, { color: adm.text }]}>Store Settings</Text>



              {/* Dark Mode Toggle */}

              <View style={[styles.adminNewOrderCard, {flexDirection: 'column', gap: 16}]}>

                <Text style={{fontSize: 13, fontWeight: '700', color: '#1B1C1C', letterSpacing: 0.5}}>APPEARANCE</Text>

                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

                  <View>

                    <Text style={{fontSize: 14, fontWeight: '600', color: '#1B1C1C'}}>Admin Dark Mode</Text>

                    <Text style={{fontSize: 12, color: '#5F5E5F', marginTop: 2}}>Toggle dark theme for the admin dashboard</Text>

                  </View>

                  <Pressable

                    onPress={() => setIsAdminDarkMode(prev => !prev)}

                    style={{

                      width: 50, height: 28, borderRadius: 14,

                      backgroundColor: isAdminDarkMode ? '#4A0404' : '#E5E7EB',

                      justifyContent: 'center',

                      paddingHorizontal: 3,

                    }}

                  >

                    <View style={{

                      width: 22, height: 22, borderRadius: 11,

                      backgroundColor: '#fff',

                      marginLeft: isAdminDarkMode ? 22 : 0,

                    }} />

                  </Pressable>

                </View>

              </View>



              {/* Currency Settings */}

              <View style={[styles.adminNewOrderCard, {flexDirection: 'column', gap: 16, marginTop: 16}]}>

                <Text style={{fontSize: 13, fontWeight: '700', color: '#1B1C1C', letterSpacing: 0.5}}>CURRENCY</Text>

                <Text style={{fontSize: 12, color: '#5F5E5F'}}>Select the default currency for the storefront.</Text>

                <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>

                  {currencyOptions.map((option) => {

                    const active = option === currency;

                    return (

                      <Pressable

                        key={option}

                        onPress={() => setCurrency(option)}

                        style={[styles.adminCurrencyToggle, active && styles.adminCurrencyToggleActive]}

                      >

                        <Text style={[styles.adminCurrencyToggleText, active && styles.adminCurrencyToggleTextActive]}>{option}</Text>

                      </Pressable>

                    );

                  })}

                </View>

              </View>



              {/* Logout */}

              <View style={[styles.adminNewOrderCard, {flexDirection: 'column', gap: 12, marginTop: 16}]}>

                <Text style={{fontSize: 13, fontWeight: '700', color: '#1B1C1C', letterSpacing: 0.5}}>ACCOUNT</Text>

                <Pressable

                  onPress={() => { setAdminUnlocked(false); setCurrentPage('shop'); }}

                  style={{backgroundColor: '#4A0404', padding: 14, alignItems: 'center'}}

                >

                  <Text style={{color: '#fff', fontWeight: '700', letterSpacing: 1, fontSize: 13}}>LOGOUT OF ADMIN</Text>

                </Pressable>

              </View>

            </View>

            )}



            {/* PRICE UPDATE TAB */}

            {activeAdminTab === 'Price Update' && (

            <View style={styles.adminDashboardSection}>

              <Text style={[styles.adminMainSubtitle, { color: adm.text }]}>Bulk Price Update</Text>

              <View style={[styles.adminNewOrderCard, {flexDirection: 'column', gap: 12}]}>

                <Text style={{fontSize: 13, fontWeight: '700', color: '#1B1C1C', letterSpacing: 0.5}}>PRODUCT PRICES</Text>

                <Text style={{fontSize: 12, color: '#5F5E5F', lineHeight: 18}}>To update individual product prices, go to the Inventory tab and tap the ✎ edit icon next to any product.</Text>

                <Pressable

                  onPress={() => setActiveAdminTab('Inventory')}

                  style={{backgroundColor: '#4A0404', padding: 14, alignItems: 'center', marginTop: 8}}

                >

                  <Text style={{color: '#fff', fontWeight: '700', letterSpacing: 1, fontSize: 13}}>GO TO INVENTORY</Text>

                </Pressable>

              </View>



              <View style={[styles.adminNewOrderCard, {flexDirection: 'column', gap: 12, marginTop: 16}]}>

                <Text style={{fontSize: 13, fontWeight: '700', color: '#1B1C1C', letterSpacing: 0.5}}>CURRENCY RATES</Text>

                <Text style={{fontSize: 12, color: '#5F5E5F', lineHeight: 18}}>Currency rates are fetched live from the open exchange rates API on app start. Switch currency display below:</Text>

                <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4}}>

                  {currencyOptions.map((option) => {

                    const active = option === currency;

                    return (

                      <Pressable

                        key={option}

                        onPress={() => setCurrency(option)}

                        style={[styles.adminCurrencyToggle, active && styles.adminCurrencyToggleActive]}

                      >

                        <Text style={[styles.adminCurrencyToggleText, active && styles.adminCurrencyToggleTextActive]}>{option}</Text>

                      </Pressable>

                    );

                  })}

                </View>

              </View>

            </View>

            )}



          <View style={{height: 80}} />

          </ScrollView>



          {/* MOBILE NAVIGATION DRAWER */}

          {adminDrawerOpen && (

            <Pressable

              onPress={closeAdminDrawer}

              style={{

                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,

                backgroundColor: 'rgba(0,0,0,0.45)',

                zIndex: 100,

              }}

            />

          )}

          <Animated.View

            style={{

              position: 'absolute',

              top: 0, left: 0, bottom: 0,

              width: 260,

              backgroundColor: palette.vault,

              zIndex: 101,

              transform: [{ translateX: drawerAnim }],

              shadowColor: '#000',

              shadowOffset: { width: 4, height: 0 },

              shadowOpacity: 0.3,

              shadowRadius: 12,

              elevation: 16,

            }}

          >

            {/* Drawer Header */}

            <View style={{

              flexDirection: 'row', alignItems: 'center',

              justifyContent: 'space-between',

              paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,

              borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',

            }}>

              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 3 }}>Prolyn Wear</Text>

              <Pressable onPress={closeAdminDrawer} style={{ padding: 6 }}>

                <FontAwesome name="times" size={18} color="rgba(255,255,255,0.6)" />

              </Pressable>

            </View>



            {/* Profile */}

            <Pressable

              onPress={() => { setTempAvatarUrl(adminAvatarUrl); setAdminProfileModalVisible(true); closeAdminDrawer(); }}

              style={{

                flexDirection: 'row', alignItems: 'center', gap: 12,

                paddingHorizontal: 20, paddingVertical: 16,

                borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',

              }}

            >

              <View style={{ position: 'relative' }}>

                <Image source={{ uri: adminAvatarUrl }} style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: '#4A0404' }} />

                <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: '#4A0404', borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>

                  <FontAwesome name="pencil" size={8} color="#fff" />

                </View>

              </View>

              <View>

                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Administrator</Text>

                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, letterSpacing: 1, marginTop: 2 }}>ADMIN ACCESS</Text>

              </View>

            </Pressable>



            {/* Main Nav Items */}

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

              <View style={{ paddingTop: 8 }}>

                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 2, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 }}>MAIN</Text>

                {[

                  { label: 'Dashboard', icon: 'home' },

                  { label: 'Inventory', icon: 'cube' },

                  { label: 'Orders', icon: 'shopping-cart' },

                  { label: 'Customers', icon: 'users' },

                  { label: 'Analytics', icon: 'bar-chart' },

                  { label: 'Riders', icon: 'motorcycle' },

                ].map(({ label, icon }) => {

                  const active = activeAdminTab === label;

                  return (

                    <Pressable

                      key={label}

                      onPress={() => navigateAdminTab(label)}

                      style={{

                        flexDirection: 'row', alignItems: 'center', gap: 14,

                        paddingHorizontal: 20, paddingVertical: 13,

                        backgroundColor: active ? 'rgba(74,4,4,0.6)' : 'transparent',

                        borderLeftWidth: active ? 3 : 0,

                        borderLeftColor: '#D26A5F',

                      }}

                    >

                      <FontAwesome name={icon} size={16} color={active ? '#D26A5F' : 'rgba(255,255,255,0.5)'} />

                      <Text style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: active ? '700' : '400', fontSize: 14 }}>{label}</Text>

                    </Pressable>

                  );

                })}



                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '700', letterSpacing: 2, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6 }}>MANAGE</Text>

                {[

                  { label: 'Settings', icon: 'cog' },

                  { label: 'Price Update', icon: 'tag' },

                ].map(({ label, icon }) => {

                  const active = activeAdminTab === label;

                  return (

                    <Pressable

                      key={label}

                      onPress={() => navigateAdminTab(label)}

                      style={{

                        flexDirection: 'row', alignItems: 'center', gap: 14,

                        paddingHorizontal: 20, paddingVertical: 13,

                        backgroundColor: active ? 'rgba(74,4,4,0.6)' : 'transparent',

                        borderLeftWidth: active ? 3 : 0,

                        borderLeftColor: '#D26A5F',

                      }}

                    >

                      <FontAwesome name={icon} size={16} color={active ? '#D26A5F' : 'rgba(255,255,255,0.5)'} />

                      <Text style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: active ? '700' : '400', fontSize: 14 }}>{label}</Text>

                    </Pressable>

                  );

                })}

              </View>

            </ScrollView>



            {/* Drawer Footer — Logout */}

            <Pressable

              onPress={() => { setAdminUnlocked(false); setCurrentPage('shop'); }}

              style={{

                flexDirection: 'row', alignItems: 'center', gap: 12,

                paddingHorizontal: 20, paddingVertical: 16,

                borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',

              }}

            >

              <FontAwesome name="sign-out" size={16} color="#D26A5F" />

              <Text style={{ color: '#D26A5F', fontWeight: '700', fontSize: 13, letterSpacing: 1 }}>LOGOUT</Text>

            </Pressable>

          </Animated.View>



          {/* ═══════════════════════════════════════════

              RIDER PICKER MODAL

          ═══════════════════════════════════════════ */}

          <Modal

            visible={riderPickerVisible}

            transparent

            animationType="fade"

            onRequestClose={() => setRiderPickerVisible(false)}

          >

            <Pressable

              onPress={() => setRiderPickerVisible(false)}

              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 }}

            >

              <Pressable

                onPress={e => e.stopPropagation()}

                style={{

                  backgroundColor: '#fff', borderRadius: 16,

                  width: '100%', maxWidth: 440,

                  shadowColor: '#000', shadowOffset: { width: 0, height: 8 },

                  shadowOpacity: 0.25, shadowRadius: 20, elevation: 16,

                  overflow: 'hidden',

                }}

              >

                {/* Modal Header */}

                <View style={{

                  backgroundColor: '#4A0404', paddingHorizontal: 20, paddingVertical: 16,

                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',

                }}>

                  <View>

                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Select a Rider</Text>

                    {riderPickerOrder && (

                      <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>

                        Order #{String(riderPickerOrder.id).slice(0, 8).toUpperCase()} · {riderPickerOrder.customer_name}

                      </Text>

                    )}

                  </View>

                  <Pressable onPress={() => setRiderPickerVisible(false)} style={{ padding: 6 }}>

                    <FontAwesome name="times" size={18} color="rgba(255,255,255,0.7)" />

                  </Pressable>

                </View>



                {/* Order Summary Strip */}

                {riderPickerDelivery && (

                  <View style={{

                    backgroundColor: '#FEF9F9', paddingHorizontal: 20, paddingVertical: 12,

                    borderBottomWidth: 1, borderBottomColor: '#F0E8E8',

                    flexDirection: 'row', alignItems: 'flex-start', gap: 10,

                  }}>

                    <FontAwesome name="map-marker" size={14} color="#4A0404" style={{ marginTop: 2 }} />

                    <View style={{ flex: 1 }}>

                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A0404', letterSpacing: 0.5 }}>DELIVERY TO</Text>

                      <Text style={{ fontSize: 13, color: '#1B1C1C', marginTop: 2 }}>{riderPickerDelivery.address}</Text>

                    </View>

                  </View>

                )}



                {/* Rider List */}

                <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>

                  <View style={{ padding: 16, gap: 10 }}>

                    {riders.length === 0 ? (

                      <View style={{ paddingVertical: 32, alignItems: 'center', gap: 10 }}>

                        <FontAwesome name="motorcycle" size={40} color="#E0E0E0" />

                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#888' }}>No riders available</Text>

                        <Text style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>

                          Go to the Riders tab to add your delivery riders first.

                        </Text>

                      </View>

                    ) : (

                      riders.map((rider) => {

                        const isSending = riderSendingId === rider.id;

                        return (

                          <View

                            key={rider.id}

                            style={{

                              flexDirection: 'row', alignItems: 'center', gap: 12,

                              borderWidth: 1,

                              borderColor: rider.is_active ? 'rgba(37,211,102,0.3)' : '#E5E7EB',

                              borderRadius: 10, padding: 12,

                              backgroundColor: rider.is_active ? 'rgba(37,211,102,0.03)' : '#FAFAFA',

                              opacity: rider.is_active ? 1 : 0.55,

                            }}

                          >

                            {/* Avatar */}

                            <View style={{

                              width: 48, height: 48, borderRadius: 24,

                              backgroundColor: rider.is_active ? '#25D366' : '#D1D5DB',

                              alignItems: 'center', justifyContent: 'center', flexShrink: 0,

                            }}>

                              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>

                                {rider.name.charAt(0).toUpperCase()}

                              </Text>

                            </View>



                            {/* Info */}

                            <View style={{ flex: 1 }}>

                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>

                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1B1C1C' }}>{rider.name}</Text>

                                <View style={{

                                  backgroundColor: rider.is_active ? '#ECFDF5' : '#F3F4F6',

                                  paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,

                                }}>

                                  <Text style={{ fontSize: 9, fontWeight: '700', color: rider.is_active ? '#10B981' : '#9CA3AF', letterSpacing: 0.5 }}>

                                    {rider.is_active ? 'AVAILABLE' : 'UNAVAILABLE'}

                                  </Text>

                                </View>

                              </View>

                              <Text style={{ fontSize: 12, color: '#5F5E5F', marginTop: 2 }}>{rider.phone}</Text>

                              {rider.notes ? <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{rider.notes}</Text> : null}

                            </View>



                            {/* Send Button */}

                            <Pressable

                              disabled={!rider.is_active || isSending}

                              onPress={() => {

                                if (!riderPickerOrder || !riderPickerDelivery) return;

                                setRiderSendingId(rider.id);

                                try {

                                  // Format phone

                                  let phone = rider.phone.replace(/[^0-9]/g, '');

                                  if (phone.startsWith('0')) phone = '233' + phone.substring(1);



                                  // Build message

                                  const msg = formatDeliveryMessage(riderPickerOrder, riderPickerDelivery);

                                  const link = createWhatsAppLink(phone, msg);



                                  // Open WhatsApp

                                  if (typeof window !== 'undefined') {

                                    window.open(link, '_blank');

                                  } else {

                                    Linking.openURL(link);

                                  }



                                  // Update order status to Delivery

                                  if (riderPickerOrder?.id) updateOrderStatus(riderPickerOrder.id, 'Delivery');



                                  setRiderPickerVisible(false);

                                } finally {

                                  setRiderSendingId(null);

                                }

                              }}

                              style={{

                                backgroundColor: !rider.is_active ? '#E5E7EB' : isSending ? '#93C5A9' : '#25D366',

                                borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,

                                flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0,

                              }}

                            >

                              <FontAwesome name="whatsapp" size={16} color="#fff" />

                              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>

                                {isSending ? '...' : 'Send'}

                              </Text>

                            </Pressable>

                          </View>

                        );

                      })

                    )}

                  </View>

                </ScrollView>



                {/* Footer note */}

                <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>

                  <Text style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>

                    WhatsApp will open with the full order details pre-filled.

                  </Text>

                </View>

              </Pressable>

            </Pressable>

          </Modal>



          {/* ═══════════════════════════════════════════

              CUSTOMER MESSAGE MODAL

          ═══════════════════════════════════════════ */}

          <Modal

            visible={!!customerMsgModal}

            transparent

            animationType="fade"

            onRequestClose={() => setCustomerMsgModal(null)}

          >

            <Pressable

              onPress={() => setCustomerMsgModal(null)}

              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 }}

            >

              <Pressable

                onPress={e => e.stopPropagation()}

                style={{

                  backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 420,

                  maxHeight: '88%',

                  overflow: 'hidden', flexDirection: 'column',

                  shadowColor: '#000', shadowOffset: { width: 0, height: 8 },

                  shadowOpacity: 0.2, shadowRadius: 20, elevation: 16,

                }}

              >

                {/* Header */}

                <View style={{ backgroundColor: '#25D366', paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                  <View>

                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Message Customer</Text>

                    {customerMsgModal && (

                      <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 }}>{customerMsgModal.name} · {customerMsgModal.phone}</Text>

                    )}

                  </View>

                  <Pressable onPress={() => setCustomerMsgModal(null)} style={{ padding: 6 }}>

                    <FontAwesome name="times" size={18} color="rgba(255,255,255,0.8)" />

                  </Pressable>

                </View>



                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 16 }}>

                  <View style={{ padding: 16, gap: 10 }}>

                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#5F5E5F', letterSpacing: 0.5, marginBottom: 4 }}>QUICK MESSAGES</Text>



                    {[

                      { label: '✅ Order Ready', msg: `Hi ${customerMsgModal?.name || 'there'}, your order from Prolyn Wear is ready and will be delivered soon! 🛍️` },

                      { label: '🚚 Out for Delivery', msg: `Hi ${customerMsgModal?.name || 'there'}, great news! Your Prolyn Wear order is on its way. Our rider will be with you shortly. 🏍️` },

                      { label: '✅ Delivered', msg: `Hi ${customerMsgModal?.name || 'there'}, your Prolyn Wear order has been delivered. Thank you for shopping with us! 🙏` },

                      { label: '💬 Follow Up', msg: `Hi ${customerMsgModal?.name || 'there'}, this is Prolyn Wear. How was your experience with us? We'd love to hear your feedback! 😊` },

                    ].map(({ label, msg }) => (

                      <Pressable

                        key={label}

                        onPress={() => setCustomMsgText(msg)}

                        style={{

                          borderWidth: 1.5,

                          borderColor: customMsgText === msg ? '#25D366' : '#E5E7EB',

                          borderRadius: 8, padding: 12,

                          backgroundColor: customMsgText === msg ? '#F0FDF4' : '#FAFAFA',

                        }}

                      >

                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#1B1C1C', marginBottom: 4 }}>{label}</Text>

                        <Text style={{ fontSize: 12, color: '#5F5E5F', lineHeight: 18 }}>{msg}</Text>

                      </Pressable>

                    ))}



                    <View style={{ height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 }} />

                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#5F5E5F', letterSpacing: 0.5 }}>CUSTOM MESSAGE</Text>

                    <TextInput

                      placeholder="Type your own message..."

                      placeholderTextColor="#9CA3AF"

                      value={customMsgText}

                      onChangeText={setCustomMsgText}

                      multiline

                      numberOfLines={3}

                      style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 13, color: '#1B1C1C', backgroundColor: '#FAFAFA', minHeight: 80, textAlignVertical: 'top' }}

                    />



                    {/* Send Button */}

                    <Pressable

                      onPress={() => {

                        if (!customerMsgModal || !customMsgText.trim()) return;

                        let phone = customerMsgModal.phone.replace(/[^0-9]/g, '');

                        if (phone.startsWith('0')) phone = '233' + phone.substring(1);

                        const link = `https://wa.me/${phone}?text=${encodeURIComponent(customMsgText.trim())}`;

                        if (typeof window !== 'undefined') window.open(link, '_blank');

                        else Linking.openURL(link);

                        setCustomerMsgModal(null);

                        setCustomMsgText('');

                      }}

                      disabled={!customMsgText.trim()}

                      style={{ backgroundColor: !customMsgText.trim() ? '#D1D5DB' : '#25D366', borderRadius: 8, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}

                    >

                      <FontAwesome name="whatsapp" size={18} color="#fff" />

                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Send via WhatsApp</Text>

                    </Pressable>

                  </View>

                </ScrollView>

              </Pressable>

            </Pressable>

          </Modal>



        </View>



      ) : isHomePage ? (

        <View style={{ flex: 1, position: 'relative' }}>
          <ScrollView 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false} 
            bounces={true} // Enable bounces for natural mobile feel
            scrollEnabled={true} // Explicitly enable scrolling
          >
            <HomeHero 
              isPhone={isPhoneScreen} 
              onNavigate={setCurrentPage}
              onOpenConsultation={() => setConsultationCardVisible(true)}
            />
            
            <HealthPrioritySection />
          </ScrollView>
          
          {/* Fixed consultation card - outside ScrollView for true fixed positioning */}
          <ConsultationCard 
            isPhone={isPhoneScreen}
            visible={isPhoneScreen ? consultationCardVisible : true}
            onClose={() => setConsultationCardVisible(false)}
          />
        </View>

      ) : isServicesPage ? (

        <View style={{ flex: 1, flexDirection: isPhoneScreen ? 'column' : 'row' }}>

          {/* ── Sidebar (desktop) / Horizontal tab strip (mobile) ── */}
          {isPhoneScreen ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              onLayout={(e) => {
                const measuredHeight = e.nativeEvent.layout.height;
                if (servicesChipBarHeight.current !== measuredHeight) {
                  console.log(`[SERVICES] Chip bar height measured: ${measuredHeight}px`);
                  servicesChipBarHeight.current = measuredHeight;
                }
              }}
              style={{
                backgroundColor: isUserDarkMode ? darkPalette.surface : '#f0f4ee',
                borderBottomWidth: 1,
                borderBottomColor: isUserDarkMode ? '#333' : '#d4e2cf',
                flexShrink: 0,
              }}
              contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              {[
                { key: 'functional-medicine', label: 'Functional Medicine' },
                { key: 'metabolic-health',    label: 'Metabolic Health' },
                { key: 'chronic-disease',     label: 'Chronic Disease' },
                { key: 'nutrition',           label: 'Nutrition' },
                { key: 'diagnostics',         label: 'Diagnostics' },
                { key: 'pharmacy',            label: 'Pharmacy' },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    console.log(`[SERVICES] Chip tapped: ${item.key}`);
                    isServicesScrollingProgrammatically.current = true;
                    setActiveServiceSection(item.key);
                    
                    // Use dynamically measured chip bar height
                    const STICKY_HEIGHT = servicesChipBarHeight.current;
                    const raw = sectionOffsets.current[item.key] ?? 0;
                    const targetY = Math.max(0, raw - STICKY_HEIGHT);
                    console.log(`[SERVICES] Scrolling to ${item.key}: raw=${raw}, stickyHeight=${STICKY_HEIGHT}, target=${targetY}`);
                    
                    servicesScrollViewRef.current?.scrollTo({ 
                      y: targetY, 
                      animated: false 
                    });
                    
                    // Longer timeout to ensure scroll completes
                    setTimeout(() => { 
                      console.log(`[SERVICES] Unlocking programmatic scroll flag for ${item.key}`);
                      isServicesScrollingProgrammatically.current = false; 
                    }, 500);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: activeServiceSection === item.key
                      ? (isUserDarkMode ? '#008000' : '#296416')
                      : (isUserDarkMode ? '#1a2e1a' : '#fff'),
                    borderWidth: 1,
                    borderColor: activeServiceSection === item.key
                      ? 'transparent'
                      : (isUserDarkMode ? '#333' : '#c5d9c0'),
                  }}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: activeServiceSection === item.key ? '700' : '500',
                    color: activeServiceSection === item.key
                      ? '#fff'
                      : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  }}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
          <View style={{ 
            width: 220,
            backgroundColor: isUserDarkMode ? darkPalette.surface : '#f8f9fa',
            borderRightWidth: 1,
            borderRightColor: isUserDarkMode ? '#333' : '#e0e0e0',
            position: 'sticky',
            top: 0,
            height: '100%',
            paddingTop: 20,
            paddingHorizontal: 16
          }}>

            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
              marginBottom: 20 
            }}>Our Services</Text>

            <ScrollView showsVerticalScrollIndicator={false}>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeServiceSection === 'functional-medicine' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isServicesScrollingProgrammatically.current = true;
                  setActiveServiceSection('functional-medicine');
                  servicesScrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  setTimeout(() => { isServicesScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeServiceSection === 'functional-medicine' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeServiceSection === 'functional-medicine' ? '600' : '400'
                }}>• Functional Medicine</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeServiceSection === 'metabolic-health' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isServicesScrollingProgrammatically.current = true;
                  setActiveServiceSection('metabolic-health');
                  servicesScrollViewRef.current?.scrollTo({ y: 400, animated: true });
                  setTimeout(() => { isServicesScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeServiceSection === 'metabolic-health' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeServiceSection === 'metabolic-health' ? '600' : '400'
                }}>• Metabolic Health</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeServiceSection === 'chronic-disease' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isServicesScrollingProgrammatically.current = true;
                  setActiveServiceSection('chronic-disease');
                  servicesScrollViewRef.current?.scrollTo({ y: 800, animated: true });
                  setTimeout(() => { isServicesScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeServiceSection === 'chronic-disease' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeServiceSection === 'chronic-disease' ? '600' : '400'
                }}>• Chronic Disease Management</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeServiceSection === 'nutrition' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isServicesScrollingProgrammatically.current = true;
                  setActiveServiceSection('nutrition');
                  servicesScrollViewRef.current?.scrollTo({ y: 1200, animated: true });
                  setTimeout(() => { isServicesScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeServiceSection === 'nutrition' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeServiceSection === 'nutrition' ? '600' : '400'
                }}>• Nutrition & Lifestyle Coaching</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeServiceSection === 'diagnostics' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isServicesScrollingProgrammatically.current = true;
                  setActiveServiceSection('diagnostics');
                  servicesScrollViewRef.current?.scrollTo({ y: 1600, animated: true });
                  setTimeout(() => { isServicesScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeServiceSection === 'diagnostics' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeServiceSection === 'diagnostics' ? '600' : '400'
                }}>• Diagnostics & Lab Services</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeServiceSection === 'pharmacy' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isServicesScrollingProgrammatically.current = true;
                  setActiveServiceSection('pharmacy');
                  servicesScrollViewRef.current?.scrollTo({ y: 2000, animated: true });
                  setTimeout(() => { isServicesScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeServiceSection === 'pharmacy' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeServiceSection === 'pharmacy' ? '600' : '400'
                }}>• Pharmacy</Text>
              </Pressable>

            </ScrollView>

          </View>
          )}

          <ScrollView 
            ref={servicesScrollViewRef}
            contentContainerStyle={{ padding: isPhoneScreen ? 20 : 40 }} 
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            onScroll={(event) => {
              // ✅ FIX: Only process scroll events when Services page is active
              if (currentPage !== 'services') {
                return;
              }
              if (isServicesScrollingProgrammatically.current) {
                console.log('[SERVICES] onScroll blocked - programmatic scroll in progress');
                return;
              }
              const offsetY = event.nativeEvent.contentOffset.y;
              const STICKY_HEIGHT = isPhoneScreen ? servicesChipBarHeight.current : 0;
              const offs = sectionOffsets.current;
              const order = ['functional-medicine','metabolic-health','chronic-disease','nutrition','diagnostics','pharmacy'];
              let active = order[0];
              for (const key of order) {
                if ((offs[key] ?? 0) - STICKY_HEIGHT <= offsetY + 20) active = key;
              }
              console.log(`[SERVICES] onScroll: offsetY=${offsetY.toFixed(1)}, calculated active=${active}`);
              if (active !== activeServiceSection) {
                console.log(`[SERVICES] Active section changing: ${activeServiceSection} -> ${active}`);
              }
              setActiveServiceSection(active);
            }}
            scrollEventThrottle={100}
          >

            <View ref={r => sectionRefs.current['functional-medicine'] = r} style={{ marginBottom: 60 }} onLayout={e => { 
              const newY = e.nativeEvent.layout.y;
              const oldY = sectionOffsets.current['functional-medicine'];
              if (oldY !== newY) {
                console.log(`[SERVICES] functional-medicine layout changed: ${oldY} -> ${newY}`);
              }
              sectionOffsets.current['functional-medicine'] = newY;
            }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                marginBottom: 16 
              }}>Functional Medicine</Text>
              <Text style={{ 
                fontSize: 16, 
                lineHeight: 24,
                color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
              }}>
                Functional medicine is a systems biology-based approach that focuses on identifying and addressing the root cause of disease. Each symptom or differential diagnosis may be one of many contributing to an individual's illness. Our practitioners look at the interactions among genetic, environmental, and lifestyle factors that can influence long-term health and complex, chronic disease.
              </Text>
            </View>

            <View ref={r => sectionRefs.current['metabolic-health'] = r} style={{ marginBottom: 60 }} onLayout={e => { 
              const newY = e.nativeEvent.layout.y;
              const oldY = sectionOffsets.current['metabolic-health'];
              if (oldY !== newY) {
                console.log(`[SERVICES] metabolic-health layout changed: ${oldY} -> ${newY}`);
              }
              sectionOffsets.current['metabolic-health'] = newY;
            }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                marginBottom: 16 
              }}>Metabolic Health</Text>
              <Text style={{ 
                fontSize: 16, 
                lineHeight: 24,
                color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
              }}>
                Metabolic health encompasses the biochemical processes that occur within your body to maintain life, including how your body converts food into energy. Our metabolic health services focus on optimizing these processes through personalized nutrition plans, exercise recommendations, and targeted supplementation to help you achieve optimal energy levels and prevent metabolic disorders.
              </Text>
            </View>

            <View ref={r => sectionRefs.current['chronic-disease'] = r} style={{ marginBottom: 60 }} onLayout={e => { 
              const newY = e.nativeEvent.layout.y;
              const oldY = sectionOffsets.current['chronic-disease'];
              if (oldY !== newY) {
                console.log(`[SERVICES] chronic-disease layout changed: ${oldY} -> ${newY}`);
              }
              sectionOffsets.current['chronic-disease'] = newY;
            }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                marginBottom: 16 
              }}>Chronic Disease Management</Text>
              <Text style={{ 
                fontSize: 16, 
                lineHeight: 24,
                color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
              }}>
                Chronic diseases such as diabetes, heart disease, and autoimmune conditions require comprehensive, ongoing care. Our chronic disease management programs combine conventional medicine with lifestyle interventions to help you manage symptoms, prevent complications, and improve your overall quality of life through evidence-based treatment protocols.
              </Text>
            </View>

            <View ref={r => sectionRefs.current['nutrition'] = r} style={{ marginBottom: 60 }} onLayout={e => { 
              const newY = e.nativeEvent.layout.y;
              const oldY = sectionOffsets.current['nutrition'];
              if (oldY !== newY) {
                console.log(`[SERVICES] nutrition layout changed: ${oldY} -> ${newY}`);
              }
              sectionOffsets.current['nutrition'] = newY;
            }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                marginBottom: 16 
              }}>Nutrition & Lifestyle Coaching</Text>
              <Text style={{ 
                fontSize: 16, 
                lineHeight: 24,
                color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
              }}>
                Nutrition and lifestyle are foundational to health and wellness. Our certified nutritionists and health coaches work with you to develop sustainable habits that support your health goals. From meal planning and grocery shopping guidance to stress management techniques and sleep optimization, we provide the tools you need for lasting change.
              </Text>
            </View>

            <View ref={r => sectionRefs.current['diagnostics'] = r} style={{ marginBottom: 60 }} onLayout={e => { 
              const newY = e.nativeEvent.layout.y;
              const oldY = sectionOffsets.current['diagnostics'];
              if (oldY !== newY) {
                console.log(`[SERVICES] diagnostics layout changed: ${oldY} -> ${newY}`);
              }
              sectionOffsets.current['diagnostics'] = newY;
            }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                marginBottom: 16 
              }}>Diagnostics & Lab Services</Text>
              <Text style={{ 
                fontSize: 16, 
                lineHeight: 24,
                color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
              }}>
                Accurate diagnosis is essential for effective treatment. We offer comprehensive diagnostic testing and laboratory services, including advanced biomarker panels, genetic testing, hormone analysis, and specialized functional medicine tests. Our state-of-the-art facilities ensure reliable results to guide your personalized treatment plan.
              </Text>
            </View>

            <View ref={r => sectionRefs.current['pharmacy'] = r} style={{ marginBottom: 60 }} onLayout={e => { 
              const newY = e.nativeEvent.layout.y;
              const oldY = sectionOffsets.current['pharmacy'];
              if (oldY !== newY) {
                console.log(`[SERVICES] pharmacy layout changed: ${oldY} -> ${newY}`);
              }
              sectionOffsets.current['pharmacy'] = newY;
            }}>
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                marginBottom: 16 
              }}>Pharmacy</Text>
              <Text style={{ 
                fontSize: 16, 
                lineHeight: 24,
                color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
              }}>
                Our integrated pharmacy services provide convenient access to prescription medications, compounded formulations, and high-quality supplements. Our pharmacists work closely with your healthcare team to ensure medication safety, proper dosing, and optimal therapeutic outcomes. We also offer medication counseling and adherence support.
              </Text>
            </View>

          </ScrollView>

        </View>

      ) : isAboutPage ? (

        <View style={{ flex: 1, flexDirection: isPhoneScreen ? 'column' : 'row' }}>

          {/* ── Sidebar (desktop) / Horizontal chip strip (mobile) ── */}
          {isPhoneScreen ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              onLayout={(e) => {
                const measuredHeight = e.nativeEvent.layout.height;
                if (aboutChipBarHeight.current !== measuredHeight) {
                  console.log(`[ABOUT] Chip bar height measured: ${measuredHeight}px`);
                  aboutChipBarHeight.current = measuredHeight;
                }
              }}
              style={{
                backgroundColor: isUserDarkMode ? darkPalette.surface : '#f0f4ee',
                borderBottomWidth: 1,
                borderBottomColor: isUserDarkMode ? '#333' : '#d4e2cf',
                flexShrink: 0,
              }}
              contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              {[
                { key: 'our-story',       label: 'Our Story' },
                { key: 'our-team',        label: 'Our Team' },
                { key: 'patient-stories', label: 'Patient Stories' },
                { key: 'blog-news',       label: 'Blog & News' },
                { key: 'vision-mission',  label: 'Vision & Mission' },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    console.log(`[ABOUT] Chip tapped: ${item.key}`);
                    isAboutScrollingProgrammatically.current = true;
                    setActiveAboutSection(item.key);
                    
                    // Use dynamically measured chip bar height
                    const STICKY_HEIGHT = aboutChipBarHeight.current;
                    const raw = aboutSectionOffsets.current[item.key] ?? 0;
                    const targetY = Math.max(0, raw - STICKY_HEIGHT);
                    console.log(`[ABOUT] Scrolling to ${item.key}: raw=${raw}, stickyHeight=${STICKY_HEIGHT}, target=${targetY}`);
                    
                    aboutScrollViewRef.current?.scrollTo({ 
                      y: targetY, 
                      animated: false 
                    });
                    
                    // Longer timeout to ensure scroll completes
                    setTimeout(() => { 
                      console.log(`[ABOUT] Unlocking programmatic scroll flag for ${item.key}`);
                      isAboutScrollingProgrammatically.current = false; 
                    }, 500);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: activeAboutSection === item.key
                      ? (isUserDarkMode ? '#008000' : '#296416')
                      : (isUserDarkMode ? '#1a2e1a' : '#fff'),
                    borderWidth: 1,
                    borderColor: activeAboutSection === item.key
                      ? 'transparent'
                      : (isUserDarkMode ? '#333' : '#c5d9c0'),
                  }}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: activeAboutSection === item.key ? '700' : '500',
                    color: activeAboutSection === item.key
                      ? '#fff'
                      : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  }}>{item.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
          <View style={{ 
            width: 220,
            backgroundColor: isUserDarkMode ? darkPalette.surface : '#f8f9fa',
            borderRightWidth: 1,
            borderRightColor: isUserDarkMode ? '#333' : '#e0e0e0',
            position: 'sticky',
            top: 0,
            height: '100%',
            paddingTop: 20,
            paddingHorizontal: 16
          }}>

            <Text style={{ 
              fontSize: 20, 
              fontWeight: '700', 
              color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
              marginBottom: 20 
            }}>About</Text>

            <ScrollView showsVerticalScrollIndicator={false}>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeAboutSection === 'our-story' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isAboutScrollingProgrammatically.current = true;
                  setActiveAboutSection('our-story');
                  aboutScrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  setTimeout(() => { isAboutScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeAboutSection === 'our-story' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeAboutSection === 'our-story' ? '600' : '400'
                }}>• Our Story</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeAboutSection === 'our-team' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isAboutScrollingProgrammatically.current = true;
                  setActiveAboutSection('our-team');
                  aboutScrollViewRef.current?.scrollTo({ y: 400, animated: true });
                  setTimeout(() => { isAboutScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeAboutSection === 'our-team' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeAboutSection === 'our-team' ? '600' : '400'
                }}>• Our Team</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeAboutSection === 'patient-stories' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isAboutScrollingProgrammatically.current = true;
                  setActiveAboutSection('patient-stories');
                  aboutScrollViewRef.current?.scrollTo({ y: 800, animated: true });
                  setTimeout(() => { isAboutScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeAboutSection === 'patient-stories' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeAboutSection === 'patient-stories' ? '600' : '400'
                }}>• Patient Stories</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeAboutSection === 'blog-news' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isAboutScrollingProgrammatically.current = true;
                  setActiveAboutSection('blog-news');
                  aboutScrollViewRef.current?.scrollTo({ y: 1200, animated: true });
                  setTimeout(() => { isAboutScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeAboutSection === 'blog-news' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeAboutSection === 'blog-news' ? '600' : '400'
                }}>• Blog & News</Text>
              </Pressable>

              <Pressable 
                style={{ 
                  paddingVertical: 12, 
                  paddingHorizontal: 12,
                  marginBottom: 4,
                  borderRadius: 6,
                  backgroundColor: activeAboutSection === 'vision-mission' 
                    ? (isUserDarkMode ? '#008000' : '#e8f5e9')
                    : 'transparent'
                }}
                onPress={() => {
                  isAboutScrollingProgrammatically.current = true;
                  setActiveAboutSection('vision-mission');
                  aboutScrollViewRef.current?.scrollTo({ y: 1600, animated: true });
                  setTimeout(() => { isAboutScrollingProgrammatically.current = false; }, 300);
                }}
              >
                <Text style={{ 
                  fontSize: 14, 
                  color: activeAboutSection === 'vision-mission' 
                    ? '#fff' 
                    : (isUserDarkMode ? darkPalette.secondary : palette.secondary),
                  fontWeight: activeAboutSection === 'vision-mission' ? '600' : '400'
                }}>• Vision & Mission</Text>
              </Pressable>

            </ScrollView>

          </View>
          )}

          <ScrollView 
            ref={aboutScrollViewRef}
            contentContainerStyle={{ padding: isPhoneScreen ? 20 : 40 }} 
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            onScroll={(event) => {
              // ✅ FIX: Only process scroll events when About page is active
              if (currentPage !== 'about') {
                return;
              }
              if (isAboutScrollingProgrammatically.current) {
                console.log('[ABOUT] onScroll blocked - programmatic scroll in progress');
                return;
              }
              const offsetY = event.nativeEvent.contentOffset.y;
              const STICKY_HEIGHT = isPhoneScreen ? aboutChipBarHeight.current : 0;
              const offs = aboutSectionOffsets.current;
              const order = ['our-story','our-team','patient-stories','blog-news','vision-mission'];
              let active = order[0];
              for (const key of order) {
                if ((offs[key] ?? 0) - STICKY_HEIGHT <= offsetY + 20) active = key;
              }
              console.log(`[ABOUT] onScroll: offsetY=${offsetY.toFixed(1)}, calculated active=${active}`);
              if (active !== activeAboutSection) {
                console.log(`[ABOUT] Active section changing: ${activeAboutSection} -> ${active}`);
              }
              setActiveAboutSection(active);
            }}
            scrollEventThrottle={100}
          >

            {/* Dynamic About Sections from Supabase */}
            {aboutSectionsLoading ? (
              <View style={{ marginBottom: 60, alignItems: 'center' }}>
                <Text style={{ 
                  fontSize: 16, 
                  color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
                }}>Loading about sections...</Text>
              </View>
            ) : aboutSectionsError ? (
              <View style={{ marginBottom: 60, alignItems: 'center' }}>
                <Text style={{ 
                  fontSize: 16, 
                  color: 'red' 
                }}>Error loading about sections: {aboutSectionsError}</Text>
              </View>
            ) : aboutSectionsData && aboutSectionsData.length > 0 ? (
              aboutSectionsData.map((section, index) => (
                <View key={section.id || index} style={{ marginBottom: 60 }} onLayout={e => { 
                  const newY = e.nativeEvent.layout.y;
                  const sectionKey = section.slug || section.title?.toLowerCase().replace(/\s+/g, '-') || `section-${index}`;
                  const oldY = aboutSectionOffsets.current[sectionKey];
                  if (oldY !== newY) {
                    console.log(`[ABOUT] ${sectionKey} layout changed: ${oldY} -> ${newY}`);
                  }
                  aboutSectionOffsets.current[sectionKey] = newY;
                }}>
                  <Text style={{ 
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                    marginBottom: 16 
                  }}>{section.title || 'Untitled Section'}</Text>
                  <Text style={{ 
                    fontSize: 16, 
                    lineHeight: 24,
                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
                  }}>
                    {section.content || section.description || 'No content available'}
                  </Text>
                </View>
              ))
            ) : (
              // Fallback to hardcoded content if no Supabase data
              <>
                <View style={{ marginBottom: 60 }} onLayout={e => { 
                  const newY = e.nativeEvent.layout.y;
                  const oldY = aboutSectionOffsets.current['our-story'];
                  if (oldY !== newY) {
                    console.log(`[ABOUT] our-story layout changed: ${oldY} -> ${newY}`);
                  }
                  aboutSectionOffsets.current['our-story'] = newY;
                }}>
                  <Text style={{ 
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                    marginBottom: 16 
                  }}>Our Story</Text>
                  <Text style={{ 
                    fontSize: 16, 
                    lineHeight: 24,
                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
                  }}>
                    K.E Green Health Clinic was founded with a vision to transform healthcare through a patient-centered, functional medicine approach. Our journey began with a simple belief: that true healing comes from addressing the root causes of illness, not just managing symptoms. Over the years, we have grown from a small practice to a comprehensive healthcare center, serving thousands of patients with personalized care that honors each individual's unique health journey.
                  </Text>
                </View>

                <View style={{ marginBottom: 60 }} onLayout={e => { 
                  const newY = e.nativeEvent.layout.y;
                  const oldY = aboutSectionOffsets.current['our-team'];
                  if (oldY !== newY) {
                    console.log(`[ABOUT] our-team layout changed: ${oldY} -> ${newY}`);
                  }
                  aboutSectionOffsets.current['our-team'] = newY;
                }}>
                  <Text style={{ 
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                    marginBottom: 16 
                  }}>Our Team</Text>
                  <Text style={{ 
                    fontSize: 16, 
                    lineHeight: 24,
                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
                  }}>
                    Our team consists of board-certified physicians, licensed nutritionists, certified health coaches, and compassionate support staff who share a passion for integrative medicine. Each member of our team brings specialized expertise and a commitment to ongoing learning in the latest advances in functional and metabolic medicine. We work collaboratively to provide you with comprehensive, coordinated care that addresses all aspects of your health.
                  </Text>
                </View>

                <View style={{ marginBottom: 60 }} onLayout={e => { 
                  const newY = e.nativeEvent.layout.y;
                  const oldY = aboutSectionOffsets.current['patient-stories'];
                  if (oldY !== newY) {
                    console.log(`[ABOUT] patient-stories layout changed: ${oldY} -> ${newY}`);
                  }
                  aboutSectionOffsets.current['patient-stories'] = newY;
                }}>
                  <Text style={{ 
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                    marginBottom: 16 
                  }}>Patient Stories</Text>
                  <Text style={{ 
                    fontSize: 16, 
                    lineHeight: 24,
                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
                  }}>
                    Every patient's journey is unique, and we are honored to be part of so many transformative health stories. From overcoming chronic conditions that seemed insurmountable to achieving wellness goals that once felt out of reach, our patients inspire us daily. These stories of hope, healing, and renewed vitality are a testament to the power of personalized, root-cause medicine and the resilience of the human spirit.
                  </Text>
                </View>

                <View style={{ marginBottom: 60 }} onLayout={e => { 
                  const newY = e.nativeEvent.layout.y;
                  const oldY = aboutSectionOffsets.current['blog-news'];
                  if (oldY !== newY) {
                    console.log(`[ABOUT] blog-news layout changed: ${oldY} -> ${newY}`);
                  }
                  aboutSectionOffsets.current['blog-news'] = newY;
                }}>
                  <Text style={{ 
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                    marginBottom: 16 
                  }}>Blog & News</Text>
                  <Text style={{ 
                    fontSize: 16, 
                    lineHeight: 24,
                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
                  }}>
                    Stay informed with the latest insights from our team of healthcare experts. Our blog features articles on nutrition, lifestyle medicine, cutting-edge research, and practical tips for optimizing your health. We also share clinic news, upcoming events, and updates on the latest services we offer. Our goal is to empower you with knowledge that supports your journey to optimal health and wellness.
                  </Text>
                </View>

                <View style={{ marginBottom: 60 }} onLayout={e => { 
                  const newY = e.nativeEvent.layout.y;
                  const oldY = aboutSectionOffsets.current['vision-mission'];
                  if (oldY !== newY) {
                    console.log(`[ABOUT] vision-mission layout changed: ${oldY} -> ${newY}`);
                  }
                  aboutSectionOffsets.current['vision-mission'] = newY;
                }}>
                  <Text style={{ 
                    fontSize: 28, 
                    fontWeight: '700', 
                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                    marginBottom: 16 
                  }}>Vision & Mission</Text>
                  <Text style={{ 
                    fontSize: 16, 
                    lineHeight: 24,
                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary 
                  }}>
                    Our vision is to create a world where healthcare is truly personalized, preventive, and focused on root causes rather than symptoms. We envision a healthcare system that empowers individuals to take control of their health through education, lifestyle modification, and targeted interventions. Our mission is to provide exceptional functional and metabolic medicine services that transform lives, one patient at a time, through compassionate care, scientific rigor, and an unwavering commitment to optimal health outcomes.
                  </Text>
                </View>
              </>
            )}

          </ScrollView>

        </View>

      ) : isContactPage ? (

        <View style={{ flex: 1, width: '100%', overflow: 'hidden' }}>

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: isPhoneScreen ? 16 : isTabletScreen ? 24 : 40,
              paddingTop: isPhoneScreen ? 20 : 32,
              paddingBottom: 64,
              width: '100%',
              maxWidth: 1180,
              alignSelf: 'center',
            }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, width: '100%' }}
          >

            <View style={{ maxWidth: isPhoneScreen ? '100%' : 640, alignSelf: 'center', width: '100%' }}>

              <Text style={{ 
                fontSize: isPhoneScreen ? 24 : isTabletScreen ? 28 : 32, 
                fontWeight: '700', 
                color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                marginBottom: 8,
                textAlign: 'center'
              }}>Contact Us</Text>

              <Text style={{ 
                fontSize: isPhoneScreen ? 14 : 16, 
                color: isUserDarkMode ? darkPalette.secondary : palette.secondary,
                marginBottom: isPhoneScreen ? 24 : 32,
                textAlign: 'center',
                lineHeight: isPhoneScreen ? 20 : 24,
                paddingHorizontal: isPhoneScreen ? 4 : 0,
              }}>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</Text>

              <View style={{ marginBottom: 20, width: '100%' }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600',
                  color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                  marginBottom: 8
                }}>Name *</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: isUserDarkMode ? '#333' : '#e0e0e0',
                    borderRadius: 8,
                    paddingVertical: isPhoneScreen ? 10 : 12,
                    paddingHorizontal: 12,
                    fontSize: isPhoneScreen ? 15 : 16,
                    color: isUserDarkMode ? '#fff' : '#000',
                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#fff',
                    width: '100%',
                    maxWidth: '100%',
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor={isUserDarkMode ? '#888' : '#888'}
                  value={contactForm.name}
                  onChangeText={(text) => setContactForm({...contactForm, name: text})}
                />
              </View>

              <View style={{ marginBottom: 20, width: '100%' }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600',
                  color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                  marginBottom: 8
                }}>Email *</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: isUserDarkMode ? '#333' : '#e0e0e0',
                    borderRadius: 8,
                    paddingVertical: isPhoneScreen ? 10 : 12,
                    paddingHorizontal: 12,
                    fontSize: isPhoneScreen ? 15 : 16,
                    color: isUserDarkMode ? '#fff' : '#000',
                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#fff',
                    width: '100%',
                    maxWidth: '100%',
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={isUserDarkMode ? '#888' : '#888'}
                  value={contactForm.email}
                  onChangeText={(text) => setContactForm({...contactForm, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={{ marginBottom: 20, width: '100%' }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600',
                  color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                  marginBottom: 8
                }}>Phone Number *</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: isUserDarkMode ? '#333' : '#e0e0e0',
                    borderRadius: 8,
                    paddingVertical: isPhoneScreen ? 10 : 12,
                    paddingHorizontal: 12,
                    fontSize: isPhoneScreen ? 15 : 16,
                    color: isUserDarkMode ? '#fff' : '#000',
                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#fff',
                    width: '100%',
                    maxWidth: '100%',
                  }}
                  placeholder="Enter your phone number"
                  placeholderTextColor={isUserDarkMode ? '#888' : '#888'}
                  value={contactForm.phone}
                  onChangeText={(text) => setContactForm({...contactForm, phone: text})}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={{ marginBottom: 24, width: '100%' }}>
                <Text style={{ 
                  fontSize: 14, 
                  fontWeight: '600',
                  color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,
                  marginBottom: 8
                }}>Message *</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: isUserDarkMode ? '#333' : '#e0e0e0',
                    borderRadius: 8,
                    paddingVertical: isPhoneScreen ? 10 : 12,
                    paddingHorizontal: 12,
                    fontSize: isPhoneScreen ? 15 : 16,
                    color: isUserDarkMode ? '#fff' : '#000',
                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#fff',
                    minHeight: isPhoneScreen ? 110 : 120,
                    textAlignVertical: 'top',
                    width: '100%',
                    maxWidth: '100%',
                  }}
                  placeholder="Enter your message"
                  placeholderTextColor={isUserDarkMode ? '#888' : '#888'}
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm({...contactForm, message: text})}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Pressable
                style={{
                  backgroundColor: '#008000',
                  paddingVertical: isPhoneScreen ? 12 : 14,
                  paddingHorizontal: 32,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: isPhoneScreen ? 32 : 40,
                  width: '100%',
                  maxWidth: isPhoneScreen ? '100%' : 280,
                  alignSelf: isPhoneScreen ? 'stretch' : 'center',
                }}
                onPress={() => {
                  alert('Thank you for your message! We will get back to you soon.');
                  setContactForm({ name: '', email: '', phone: '', message: '' });
                }}
              >
                <Text style={{ color: '#fff', fontSize: isPhoneScreen ? 15 : 16, fontWeight: '600' }}>Submit</Text>
              </Pressable>

            </View>

            <LocateUsSection isDarkMode={isUserDarkMode} />

          </ScrollView>

        </View>

      ) : isBlogsPage ? (

        <BlogPage
          isUserDarkMode={isUserDarkMode}
          isPhoneScreen={isPhoneScreen}
          isTabletScreen={isTabletScreen}
        />

      ) : isShopPage ? (

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>

        {/* Hero Slider - Only on Shop Page */}
        <HeroSlider 
          isPhone={isPhoneScreen}
        />

        {/* <CarouselComponent

          onProductPress={(productId) => {

            setCurrentPage('home');

            setActiveCategory('All');

            setTimeout(() => {

              const target = productCards.find(p => p.id === productId);

              if (target) setActiveCategory(target.categoryLabel || 'All');

            }, 100);

          }}

        /> */}



        {(() => {

          const chips = categoryChips.map((cat) => {

            const active = cat === activeCategory;

            return (

              <Pressable

                key={cat}

                onPress={() => setActiveCategory(cat)}

                style={[

                  styles.chipGridItem,

                  active && styles.chipActive,

                  isMobileOrTablet && { paddingHorizontal: 12, paddingVertical: 6, minHeight: 30 },

                  !active && {

                    borderColor: isUserDarkMode ? '#444' : 'rgba(27,28,28,0.18)',

                    backgroundColor: isUserDarkMode ? darkPalette.surface : 'transparent'

                  }

                ]}

              >

                <Text style={[

                  styles.chipText,

                  active && styles.chipTextActive,

                  isMobileOrTablet && { fontSize: 11 },

                  !active && { color: isUserDarkMode ? darkPalette.secondary : palette.secondary }

                ]}>{cat}</Text>

              </Pressable>

            );

          });



          if (isMobileOrTablet) {

            return (

              <View style={[styles.chipsScrollContent, { flexWrap: 'wrap', paddingBottom: 12, marginTop: 8, width: '100%', justifyContent: 'flex-start' }]}>

                {chips}

              </View>

            );

          }



          return (

            <ScrollView

              horizontal

              showsHorizontalScrollIndicator={false}

              contentContainerStyle={styles.chipsScrollContent}

              style={styles.chipsScrollView}

            >

              {chips}

            </ScrollView>

          );

        })()}



        <View style={[styles.searchWrap, {

          backgroundColor: isUserDarkMode ? darkPalette.surface : undefined,

          borderColor: isUserDarkMode ? '#333' : undefined

        }]}>

          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>

            <TextInput

              value={search}

              onChangeText={setSearch}

              placeholder="Search category"

              placeholderTextColor={isUserDarkMode ? '#666' : '#89726F'}

              style={[styles.searchInput, {

                flex: 1,

                color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,

                backgroundColor: isUserDarkMode ? darkPalette.background : undefined

              }]}

            />

            <Pressable

              onPress={refreshProducts}

              style={{

                backgroundColor: '#9CA3AF',

                paddingHorizontal: 12,

                height: 42,

                borderRadius: 8,

                justifyContent: 'center',

                alignItems: 'center',

              }}

              accessibilityLabel="Refresh products"

            >

              <FontAwesome name="refresh" size={16} color="#fff" />

            </Pressable>

          </View>

        </View>



        <View style={[styles.productGrid, { paddingHorizontal: PADDING, rowGap: GAP, columnGap: GAP, paddingBottom: 200 }]}>

          {filteredCategories.map((category) => (

            <CategoryCard

              key={category.id}

              category={category}

              cardWidth={cardWidth}

              currency={currency}

              onAddToCart={addToCart}

              onRemoveFromCart={removeFromCart}

              cartItems={cartItems}

              onViewDetails={(product) => {

                setSelectedProduct(product);

                setProductDetailVisible(true);

              }}

              isPhone={isCompactCard}

              isUserDarkMode={isUserDarkMode}

            />

          ))}

          {filteredCategories.length === 0 ? (

            <View style={styles.emptyState}>

              <Text style={styles.emptyTitle}>No category found</Text>

              <Text style={styles.emptyBody}>Try another search term or select a different chip.</Text>

            </View>

          ) : null}

        </View>

      </ScrollView>

      ) : null}



      {isShopPage && (

        <Animated.View

          style={[

            styles.checkoutBar,

            {

              opacity: cartBarAnim,

              transform: [

                {

                  translateY: cartBarAnim.interpolate({

                    inputRange: [0, 1],

                    outputRange: [100, 0],

                  }),

                },

              ],

            },

          ]}

          pointerEvents={cartCount > 0 ? 'auto' : 'none'}

        >

        <View>

          <Text style={styles.checkoutLabel}>YOUR MEDICINES</Text>

          <Text style={styles.checkoutText}>{cartCount} item{cartCount !== 1 ? 's' : ''} in cart</Text>

        </View>

        <View style={styles.checkoutActions}>

          <Pressable style={styles.checkoutBtn} onPress={openCart}>

            <Text style={styles.checkoutBtnText}>VIEW CART</Text>

          </Pressable>

        </View>

      </Animated.View>

      )}



      {isShopPage && (

        <View style={styles.bottomNav}>

          <Pressable

            key="shop"

            style={styles.navItem}

            onPress={() => setCurrentPage('shop')}

          >

            <View style={[styles.navIconCircle, currentPage === 'shop' && styles.navIconCircleActive]}>

              <FontAwesome name="home" size={20} color='#008000' />

            </View>

            <Text style={[styles.navLabel, currentPage === 'shop' && styles.navLabelActive]}>Shop</Text>

          </Pressable>



          <Pressable

            key="cart"

            style={styles.navItem}

            onPress={openCart}

          >

            <View style={[styles.navIconCircle, cartModalVisible && styles.navIconCircleActive]}>

              <FontAwesome name="shopping-cart" size={20} color='#008000' />

            </View>

            <Text style={[styles.navLabel, cartModalVisible && styles.navLabelActive]}>Cart</Text>

          </Pressable>



          <Pressable

            key="account"

            style={styles.navItem}

            onPress={() => {

              if (user) {

                fetchCustomerOrders();

                setUserAccountSheetVisible(true);

              } else {

                setIsLoginMode(true);

                setAuthModalVisible(true);

              }

            }}

          >

            <View style={[styles.navIconCircle, userAccountSheetVisible && styles.navIconCircleActive]}>

              <FontAwesome name="user" size={20} color='#008000' />

            </View>

            <Text style={[styles.navLabel, userAccountSheetVisible && styles.navLabelActive]}>

              {user ? 'Account' : 'Sign In'}

            </Text>

          </Pressable>

        </View>

      )}



      {/* CHECKOUT MODAL */}

      <Modal visible={checkoutModalVisible} animationType="fade" transparent={true} onRequestClose={() => setCheckoutModalVisible(false)}>

        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>

          <View style={{ 

            backgroundColor: isUserDarkMode ? darkPalette.background : palette.background, 

            borderWidth: 1, 

            borderColor: isUserDarkMode ? '#333' : palette.oxblood, 

            padding: 20,

            width: '100%',

            maxWidth: 580,

            alignSelf: 'center',

            shadowColor: '#000',

            shadowOffset: { width: 0, height: 8 },

            shadowOpacity: 0.15,

            shadowRadius: 16,

            elevation: 8

          }}>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>

              <Text style={{ 

                color: isUserDarkMode ? darkPalette.oxbloodSoft : palette.oxbloodSoft, 

                fontSize: 11, 

                letterSpacing: 1.8, 

                fontWeight: '700' 

              }}>DELIVERY DETAILS</Text>

              <Text style={{ 

                fontFamily: 'Georgia', 

                fontSize: 26, 

                fontWeight: '700', 

                color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood, 

                marginTop: 4 

              }}>Complete Your Order</Text>

              <Text style={{ 

                fontSize: 13, 

                color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                lineHeight: 18, 

                marginBottom: 8 

              }}>

                Provide your contact details and shipping address to place this order. Payment is cash on delivery.

              </Text>



              <View style={{ gap: 4 }}>

                <Text style={{ 

                  fontSize: 11, 

                  fontWeight: '700', 

                  color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                  letterSpacing: 0.8 

                }}>FULL NAME *</Text>

                <TextInput

                  value={customerName}

                  onChangeText={setCustomerName}

                  placeholder="e.g. John Doe"

                  placeholderTextColor={isUserDarkMode ? '#666' : '#89726F'}

                  style={[styles.adminLoginInput, {

                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#FAFAFA',

                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,

                    borderColor: isUserDarkMode ? '#444' : 'rgba(74,4,4,0.2)'

                  }]}

                />

              </View>



              <View style={{ gap: 4 }}>

                <Text style={{ 

                  fontSize: 11, 

                  fontWeight: '700', 

                  color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                  letterSpacing: 0.8 

                }}>PHONE NUMBER *</Text>

                <TextInput

                  value={customerPhone}

                  onChangeText={setCustomerPhone}

                  keyboardType="phone-pad"

                  placeholder="e.g. +233 24 000 0000"

                  placeholderTextColor={isUserDarkMode ? '#666' : '#89726F'}

                  style={[styles.adminLoginInput, {

                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#FAFAFA',

                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,

                    borderColor: isUserDarkMode ? '#444' : 'rgba(74,4,4,0.2)'

                  }]}

                />

              </View>



              <View style={{ gap: 4 }}>

                <Text style={{ 

                  fontSize: 11, 

                  fontWeight: '700', 

                  color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                  letterSpacing: 0.8 

                }}>EMAIL ADDRESS</Text>

                <TextInput

                  value={customerEmail}

                  onChangeText={setCustomerEmail}

                  keyboardType="email-address"

                  autoCapitalize="none"

                  placeholder="e.g. john@example.com"

                  placeholderTextColor={isUserDarkMode ? '#666' : '#89726F'}

                  style={[styles.adminLoginInput, {

                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#FAFAFA',

                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,

                    borderColor: isUserDarkMode ? '#444' : 'rgba(74,4,4,0.2)'

                  }]}

                />

              </View>



              <View style={{ gap: 4 }}>

                <Text style={{ 

                  fontSize: 11, 

                  fontWeight: '700', 

                  color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                  letterSpacing: 0.8 

                }}>DELIVERY ADDRESS *</Text>

                <TextInput

                  value={deliveryAddress}

                  onChangeText={setDeliveryAddress}

                  multiline={true}

                  numberOfLines={3}

                  placeholder="Street name, house number, landmarks..."

                  placeholderTextColor={isUserDarkMode ? '#666' : '#89726F'}

                  style={[styles.adminLoginInput, { 

                    height: 80, 

                    textAlignVertical: 'top',

                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#FAFAFA',

                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,

                    borderColor: isUserDarkMode ? '#444' : 'rgba(74,4,4,0.2)'

                  }]}

                />

              </View>



              <View style={{ 

                borderTopWidth: 1, 

                borderTopColor: isUserDarkMode ? '#333' : 'rgba(27,28,28,0.1)', 

                paddingTop: 14, 

                marginTop: 8, 

                flexDirection: 'row', 

                gap: 10 

              }}>

                <Pressable 

                  onPress={() => setCheckoutModalVisible(false)}

                  style={{ 

                    flex: 1, 

                    borderWidth: 1, 

                    borderColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood, 

                    paddingVertical: 12, 

                    alignItems: 'center', 

                    backgroundColor: isUserDarkMode ? darkPalette.background : '#fff' 

                  }}

                >

                  <Text style={{ 

                    color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood, 

                    fontWeight: '700', 

                    fontSize: 12, 

                    letterSpacing: 1 

                  }}>CANCEL</Text>

                </Pressable>

                

                <Pressable 

                  onPress={submitOrder}

                  disabled={isSubmittingOrder}

                  style={{ 

                    flex: 1, 

                    backgroundColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood, 

                    paddingVertical: 12, 

                    alignItems: 'center' 

                  }}

                >

                  {isSubmittingOrder ? (

                    <ActivityIndicator size="small" color="#fff" />

                  ) : (

                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>PLACE ORDER</Text>

                  )}

                </Pressable>

              </View>

            </ScrollView>

          </View>

        </View>

      </Modal>



      {/* CART BOTTOM SHEET */}

      <Modal visible={cartModalVisible} animationType="none" transparent={true} onRequestClose={closeCart}>

        <View style={styles.bottomSheetBackdrop}>

          <Pressable style={styles.bottomSheetBackdropDismiss} onPress={closeCart} />

          <Animated.View style={[styles.bottomSheetContainer, {

            backgroundColor: isUserDarkMode ? darkPalette.background : '#FFF',

            transform: [{

              translateY: cartSheetAnim.interpolate({

                inputRange: [0, 1],

                outputRange: [0, 1000],

              })

            }]

          }]}>

            <View style={[styles.bottomSheetHandle, {

              backgroundColor: isUserDarkMode ? '#555' : 'rgba(0,0,0,0.2)'

            }]} />

            <View style={[styles.bottomSheetHeader, {

              borderBottomColor: isUserDarkMode ? '#333' : 'rgba(27, 28, 28, 0.1)'

            }]}>

              <Text style={[styles.bottomSheetTitle, {

                color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

              }]}>YOUR CART</Text>

              <Pressable onPress={closeCart} style={{ padding: 4 }}>

                <Text style={[styles.bottomSheetCloseBtn, {

                  color: isUserDarkMode ? '#B0B0B0' : palette.charcoal

                }]}>✕</Text>

              </Pressable>

            </View>



            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 24 }}>

              {cartItems.length > 0 ? (

                cartItems.map((item) => (

                  <View key={`${item.id}-${item.selectedWeight}`} style={[styles.cartRow, {

                    backgroundColor: isUserDarkMode ? darkPalette.surface : '#FAFAFA',

                    borderColor: isUserDarkMode ? '#333' : 'rgba(27,28,28,0.08)'

                  }]}>

                    <View style={styles.cartRowTextWrap}>

                      <View style={styles.cartRowTop}>

                        <Image source={{ uri: item.image }} style={styles.cartRowImage} />

                        <View style={styles.cartRowCopy}>

                          <Text style={[styles.cartRowName, {

                            color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal

                          }]}>{item.name}</Text>

                          <Text style={[styles.cartRowMeta, {

                            color: isUserDarkMode ? darkPalette.secondary : palette.secondary

                          }]}>

                            {item.selectedWeight && item.selectedWeight !== 'unit' ? `${item.selectedWeight} · ` : ''}{formatCurrency(item.unitPrice)} each

                          </Text>

                          <Text style={[styles.cartRowMeta, {

                            color: isUserDarkMode ? darkPalette.secondary : palette.secondary

                          }]}>Line total: {formatCurrency(item.lineTotal)}</Text>

                        </View>

                      </View>

                    </View>



                    <View style={styles.cartRowControls}>

                      <Pressable

                        onPress={() => changeCartQuantity(item.id, item.selectedWeight, -1)}

                        style={[styles.cartStepButton, {

                          borderColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

                        }]}

                      >

                        <Text style={[styles.cartStepButtonText, {

                          color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

                        }]}>-</Text>

                      </Pressable>

                      <Text style={[styles.cartQuantity, {

                        color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal

                      }]}>{item.quantity}</Text>

                      <Pressable

                        onPress={() => changeCartQuantity(item.id, item.selectedWeight, 1)}

                        style={[styles.cartStepButton, {

                          borderColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

                        }]}

                      >

                        <Text style={[styles.cartStepButtonText, {

                          color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

                        }]}>+</Text>

                      </Pressable>

                    </View>

                  </View>

                ))

              ) : (

                <View style={[styles.emptyState, { marginVertical: 32 }]}>

                  <Text style={[styles.emptyTitle, {

                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal

                  }]}>Your cart is empty</Text>

                  <Text style={[styles.emptyBody, {

                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary

                  }]}>Add products from the shop to see them here.</Text>

                </View>

              )}

            </ScrollView>



            {cartItems.length > 0 && (

              <View style={[styles.bottomSheetSummaryCard, {

                backgroundColor: isUserDarkMode ? darkPalette.surface : '#F8F8F8',

                borderTopColor: isUserDarkMode ? '#333' : 'rgba(27, 28, 28, 0.1)'

              }]}>

                <View>

                  <Text style={[styles.bottomSheetSummaryLabel, {

                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary

                  }]}>TOTAL AMOUNT</Text>

                  <Text style={[styles.bottomSheetSummaryValue, {

                    color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

                  }]}>{formatCurrency(cartTotal)}</Text>

                </View>

                <Pressable style={[styles.checkoutBtn, {

                  backgroundColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood

                }]} onPress={() => {

                  closeCart();

                  if (!user) {

                    alert('Please sign in or create an account to proceed to checkout.');

                    setIsLoginMode(true);

                    setAuthModalVisible(true);

                  } else {

                    setCheckoutModalVisible(true);

                  }

                }}>

                  <Text style={styles.checkoutBtnText}>PROCEED TO CHECKOUT</Text>

                </Pressable>

              </View>

            )}

          </Animated.View>

        </View>

      </Modal>



      {/* ORDER SUCCESS MODAL */}

      <Modal visible={orderSuccessModalVisible} animationType="fade" transparent={true} onRequestClose={() => setOrderSuccessModalVisible(false)}>

        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>

          <View style={{ backgroundColor: palette.vault, borderWidth: 1, borderColor: '#fff', padding: 22, alignItems: 'center' }}>

            <Text style={{ color: palette.oxbloodSoft, fontSize: 36, fontWeight: 'bold', marginBottom: 12 }}>✓</Text>

            <Text style={{ color: palette.oxbloodSoft, fontSize: 11, letterSpacing: 1.8, fontWeight: '700' }}>ORDER PLACED SUCCESSFULLY</Text>

            <Text style={{ fontFamily: 'Georgia', fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', marginTop: 6, marginBottom: 12 }}>

              Thank you for your order!

            </Text>

            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 18 }}>

              Your order has been recorded. Our butcher is preparing your cuts. You will receive a call shortly at the provided number to confirm delivery.

            </Text>

            

            <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: '100%', padding: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>

              <Text style={{ fontSize: 10, fontWeight: '700', color: '#888989', letterSpacing: 1 }}>ORDER REFERENCE</Text>

              <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'Georgia', marginTop: 4 }}>

                {lastCreatedOrderId}

              </Text>

            </View>



            <Pressable 

              onPress={() => {

                setOrderSuccessModalVisible(false);

                setCurrentPage('shop');

              }}

              style={{ backgroundColor: palette.oxbloodSoft, width: '100%', paddingVertical: 13, alignItems: 'center' }}

            >

              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1.4 }}>CONTINUE SHOPPING</Text>

            </Pressable>

          </View>

        </View>

      </Modal>



      {/* ADMIN PROFILE MODAL */}

      <Modal visible={adminProfileModalVisible} animationType="fade" transparent={true} onRequestClose={() => setAdminProfileModalVisible(false)}>

        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>

          <View style={{ 

            backgroundColor: palette.background, 

            borderWidth: 1, 

            borderColor: palette.oxblood, 

            padding: 20,

            width: '100%',

            maxWidth: 580,

            alignSelf: 'center',

            shadowColor: '#000',

            shadowOffset: { width: 0, height: 8 },

            shadowOpacity: 0.15,

            shadowRadius: 16,

            elevation: 8

          }}>

            <Text style={{ fontFamily: 'Georgia', fontSize: 20, fontWeight: '700', color: palette.oxblood, marginBottom: 14 }}>Update Profile Photo</Text>

            

            <View style={{ gap: 4 }}>

              <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>IMAGE URL</Text>

              <TextInput

                value={tempAvatarUrl}

                onChangeText={setTempAvatarUrl}

                placeholder="Paste new image URL..."

                placeholderTextColor="#89726F"

                style={styles.adminLoginInput}

              />

            </View>



            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(27,28,28,0.1)', paddingTop: 14, marginTop: 14, flexDirection: 'row', gap: 10 }}>

              <Pressable 

                onPress={() => setAdminProfileModalVisible(false)}

                style={{ flex: 1, borderWidth: 1, borderColor: palette.oxblood, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' }}

              >

                <Text style={{ color: palette.oxblood, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>

              </Pressable>

              

              <Pressable 

                onPress={() => {

                  setAdminAvatarUrl(tempAvatarUrl);

                  setAdminProfileModalVisible(false);

                }}

                style={{ flex: 1, backgroundColor: palette.oxblood, paddingVertical: 12, alignItems: 'center' }}

              >

                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>SAVE PHOTO</Text>

              </Pressable>

            </View>

          </View>

        </View>

      </Modal>



      {/* ADMIN ADD PRODUCT MODAL */}

      <Modal visible={addProductModalVisible} animationType="fade" transparent={true} onRequestClose={() => setAddProductModalVisible(false)}>

        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>

          <View style={{ 

            backgroundColor: palette.background, 

            borderWidth: 1, 

            borderColor: palette.oxblood, 

            padding: 20,

            width: '100%',

            maxWidth: 580,

            alignSelf: 'center',

            shadowColor: '#000',

            shadowOffset: { width: 0, height: 8 },

            shadowOpacity: 0.15,

            shadowRadius: 16,

            elevation: 8

          }}>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>

              <Text style={{ color: palette.oxbloodSoft, fontSize: 11, letterSpacing: 1.8, fontWeight: '700' }}>CATALOG MANAGER</Text>

              <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: palette.oxblood, marginTop: 4 }}>Add New Product</Text>

              

              <View style={{ gap: 4 }}>

                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRODUCT NAME *</Text>

                <TextInput

                  value={newProduct.name}

                  onChangeText={(txt) => setNewProduct({ ...newProduct, name: txt })}

                  placeholder="e.g. Ribeye Steak A5"

                  placeholderTextColor="#89726F"

                  style={styles.adminLoginInput}

                />

              </View>



              <View style={{ gap: 4 }}>

                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICING TYPE *</Text>

                <View style={{ flexDirection: 'row', gap: 10 }}>

                  <Pressable

                    onPress={() => setNewProduct({ ...newProduct, has_weights: true })}

                    style={{

                      flex: 1,

                      borderWidth: 1,

                      borderColor: newProduct.has_weights ? palette.oxblood : 'rgba(27,28,28,0.2)',

                      backgroundColor: newProduct.has_weights ? 'rgba(74,4,4,0.05)' : '#fff',

                      paddingVertical: 10,

                      alignItems: 'center',

                    }}

                  >

                    <Text style={{ fontSize: 12, fontWeight: '700', color: newProduct.has_sizes ? palette.oxblood : palette.secondary }}>SIZE-BASED</Text>

                  </Pressable>

                  <Pressable

                    onPress={() => setNewProduct({ ...newProduct, has_sizes: false, has_weights: false })}

                    style={{

                      flex: 1,

                      borderWidth: 1,

                      borderColor: !newProduct.has_sizes ? palette.oxblood : 'rgba(27,28,28,0.2)',

                      backgroundColor: !newProduct.has_sizes ? 'rgba(74,4,4,0.05)' : '#fff',

                      paddingVertical: 10,

                      alignItems: 'center',

                    }}

                  >

                    <Text style={{ fontSize: 12, fontWeight: '700', color: !newProduct.has_sizes ? palette.oxblood : palette.secondary }}>UNIT-BASED</Text>

                  </Pressable>

                </View>

              </View>



              {newProduct.has_sizes ? (

                <>

                  <View style={{ gap: 4 }}>

                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR S *</Text>

                    <TextInput

                      value={newProduct.price_s}

                      onChangeText={(txt) => setNewProduct({ ...newProduct, price_s: txt })}

                      keyboardType="numeric"

                      placeholder="e.g. 25.00"

                      placeholderTextColor="#89726F"

                      style={styles.adminLoginInput}

                    />

                  </View>



                  <View style={{ gap: 4 }}>

                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR M *</Text>

                    <TextInput

                      value={newProduct.price_m}

                      onChangeText={(txt) => setNewProduct({ ...newProduct, price_m: txt })}

                      keyboardType="numeric"

                      placeholder="e.g. 28.00"

                      placeholderTextColor="#89726F"

                      style={styles.adminLoginInput}

                    />

                  </View>



                  <View style={{ gap: 4 }}>

                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR L *</Text>

                    <TextInput

                      value={newProduct.price_l}

                      onChangeText={(txt) => setNewProduct({ ...newProduct, price_l: txt })}

                      keyboardType="numeric"

                      placeholder="e.g. 30.00"

                      placeholderTextColor="#89726F"

                      style={styles.adminLoginInput}

                    />

                  </View>



                  <View style={{ gap: 4 }}>

                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR XL *</Text>

                    <TextInput

                      value={newProduct.price_xl}

                      onChangeText={(txt) => setNewProduct({ ...newProduct, price_xl: txt })}

                      keyboardType="numeric"

                      placeholder="e.g. 32.00"

                      placeholderTextColor="#89726F"

                      style={styles.adminLoginInput}

                    />

                  </View>



                  <View style={{ gap: 4 }}>

                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR XXL *</Text>

                    <TextInput

                      value={newProduct.price_xxl}

                      onChangeText={(txt) => setNewProduct({ ...newProduct, price_xxl: txt })}

                      keyboardType="numeric"

                      placeholder="e.g. 35.00"

                      placeholderTextColor="#89726F"

                      style={styles.adminLoginInput}

                    />

                  </View>

                </>

              ) : (

                <View style={{ gap: 4 }}>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>UNIT PRICE *</Text>

                  <TextInput

                    value={newProduct.price}

                    onChangeText={(txt) => setNewProduct({ ...newProduct, price: txt })}

                    keyboardType="numeric"

                    placeholder="e.g. 35.00"

                    placeholderTextColor="#89726F"

                    style={styles.adminLoginInput}

                  />

                </View>

              )}



              <View style={{ gap: 4 }}>

                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>CATEGORY / CHIP (E.g. Chicken, Beef, Pork) *</Text>

                <TextInput

                  value={newProduct.category_name}

                  onChangeText={(txt) => setNewProduct({ ...newProduct, category_name: txt, tag: txt })}

                  placeholder="e.g. Cow And Beef"

                  placeholderTextColor="#89726F"

                  style={styles.adminLoginInput}

                />

              </View>



              <View style={{ gap: 4 }}>

                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>TAG / LABEL (E.g. Best Seller)</Text>

                <TextInput

                  value={newProduct.tag}

                  onChangeText={(txt) => setNewProduct({ ...newProduct, tag: txt })}

                  placeholder="e.g. Best Seller"

                  placeholderTextColor="#89726F"

                  style={styles.adminLoginInput}

                />

              </View>



              <View style={{ gap: 4 }}>

                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>DESCRIPTION *</Text>

                <TextInput

                  value={newProduct.description}

                  onChangeText={(txt) => setNewProduct({ ...newProduct, description: txt })}

                  multiline={true}

                  numberOfLines={2}

                  placeholder="Describe cuts, grade, source..."

                  placeholderTextColor="#89726F"

                  style={[styles.adminLoginInput, { height: 60, textAlignVertical: 'top' }]}

                />

              </View>



              <View style={{ gap: 4 }}>

                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>IMAGE URL</Text>

                <TextInput

                  value={newProduct.image_url}

                  onChangeText={(txt) => setNewProduct({ ...newProduct, image_url: txt })}

                  placeholder="Paste URL starting with https://..."

                  placeholderTextColor="#89726F"

                  style={styles.adminLoginInput}

                />

              </View>



              <View style={{ gap: 4 }}>

                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>CURRENT STOCK ({newProduct.has_weights ? 'KG' : 'UNITS'})</Text>

                <TextInput

                  value={newProduct.stock_quantity}

                  onChangeText={(txt) => setNewProduct({ ...newProduct, stock_quantity: txt })}

                  keyboardType="numeric"

                  placeholder="e.g. 50"

                  placeholderTextColor="#89726F"

                  style={styles.adminLoginInput}

                />

              </View>



              <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(27,28,28,0.1)', paddingTop: 14, marginTop: 8, flexDirection: 'row', gap: 10 }}>

                <Pressable 

                  onPress={() => setAddProductModalVisible(false)}

                  style={{ flex: 1, borderWidth: 1, borderColor: palette.oxblood, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' }}

                >

                  <Text style={{ color: palette.oxblood, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>

                </Pressable>

                

                <Pressable 

                  onPress={adminAddProduct}

                  style={{ flex: 1, backgroundColor: palette.oxblood, paddingVertical: 12, alignItems: 'center' }}

                >

                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>SAVE PRODUCT</Text>

                </Pressable>

              </View>

            </ScrollView>

          </View>

        </View>

      </Modal>



      {/* ADMIN EDIT PRODUCT MODAL */}

      <Modal visible={editProductModalVisible} animationType="fade" transparent={true} onRequestClose={() => setEditProductModalVisible(false)}>

        <View style={{ flex: 1, backgroundColor: 'rgba(27,28,28,0.6)', justifyContent: 'center', padding: 16 }}>

          {editingProduct && (

            <View style={{ 

              backgroundColor: palette.background, 

              borderWidth: 1, 

              borderColor: palette.oxblood, 

              padding: 20,

              width: '100%',

              maxWidth: 580,

              alignSelf: 'center',

              shadowColor: '#000',

              shadowOffset: { width: 0, height: 8 },

              shadowOpacity: 0.15,

              shadowRadius: 16,

              elevation: 8

            }}>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>

                <Text style={{ color: palette.oxbloodSoft, fontSize: 11, letterSpacing: 1.8, fontWeight: '700' }}>CATALOG MANAGER</Text>

                <Text style={{ fontFamily: 'Georgia', fontSize: 26, fontWeight: '700', color: palette.oxblood, marginTop: 4 }}>Edit Product</Text>

                

                <View style={{ gap: 4 }}>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRODUCT NAME *</Text>

                  <TextInput

                    value={editingProduct.name}

                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, name: txt })}

                    placeholder="Product Name"

                    placeholderTextColor="#89726F"

                    style={styles.adminLoginInput}

                  />

                </View>



                <View style={{ gap: 4 }}>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICING TYPE *</Text>

                  <View style={{ flexDirection: 'row', gap: 10 }}>

                    <Pressable

                      onPress={() => setEditingProduct({ ...editingProduct, hasWeights: true })}

                      style={{

                        flex: 1,

                        borderWidth: 1,

                        borderColor: (editingProduct.hasSizes || editingProduct.hasWeights) ? palette.oxblood : 'rgba(27,28,28,0.2)',

                        backgroundColor: (editingProduct.hasSizes || editingProduct.hasWeights) ? 'rgba(74,4,4,0.05)' : '#fff',

                        paddingVertical: 10,

                        alignItems: 'center',

                      }}

                    >

                      <Text style={{ fontSize: 12, fontWeight: '700', color: (editingProduct.hasSizes || editingProduct.hasWeights) ? palette.oxblood : palette.secondary }}>SIZE-BASED</Text>

                    </Pressable>

                    <Pressable

                      onPress={() => setEditingProduct({ ...editingProduct, hasSizes: false, hasWeights: false })}

                      style={{

                        flex: 1,

                        borderWidth: 1,

                        borderColor: !(editingProduct.hasSizes || editingProduct.hasWeights) ? palette.oxblood : 'rgba(27,28,28,0.2)',

                        backgroundColor: !(editingProduct.hasSizes || editingProduct.hasWeights) ? 'rgba(74,4,4,0.05)' : '#fff',

                        paddingVertical: 10,

                        alignItems: 'center',

                      }}

                    >

                      <Text style={{ fontSize: 12, fontWeight: '700', color: !(editingProduct.hasSizes || editingProduct.hasWeights) ? palette.oxblood : palette.secondary }}>UNIT-BASED</Text>

                    </Pressable>

                  </View>

                </View>



                {(editingProduct.hasSizes || editingProduct.hasWeights) ? (

                  <>

                    <View style={{ gap: 4 }}>

                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR S *</Text>

                      <TextInput

                        value={editingProduct.price_s !== undefined && editingProduct.price_s !== null ? String(editingProduct.price_s) : ''}

                        onChangeText={(txt) => setEditingProduct({ ...editingProduct, price_s: txt })}

                        keyboardType="numeric"

                        placeholder="e.g. 25.00"

                        placeholderTextColor="#89726F"

                        style={styles.adminLoginInput}

                      />

                    </View>



                    <View style={{ gap: 4 }}>

                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR M *</Text>

                      <TextInput

                        value={editingProduct.price_m !== undefined && editingProduct.price_m !== null ? String(editingProduct.price_m) : ''}

                        onChangeText={(txt) => setEditingProduct({ ...editingProduct, price_m: txt })}

                        keyboardType="numeric"

                        placeholder="e.g. 28.00"

                        placeholderTextColor="#89726F"

                        style={styles.adminLoginInput}

                      />

                    </View>



                    <View style={{ gap: 4 }}>

                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR L *</Text>

                      <TextInput

                        value={editingProduct.price_l !== undefined && editingProduct.price_l !== null ? String(editingProduct.price_l) : ''}

                        onChangeText={(txt) => setEditingProduct({ ...editingProduct, price_l: txt })}

                        keyboardType="numeric"

                        placeholder="e.g. 30.00"

                        placeholderTextColor="#89726F"

                        style={styles.adminLoginInput}

                      />

                    </View>



                    <View style={{ gap: 4 }}>

                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR XL *</Text>

                      <TextInput

                        value={editingProduct.price_xl !== undefined && editingProduct.price_xl !== null ? String(editingProduct.price_xl) : ''}

                        onChangeText={(txt) => setEditingProduct({ ...editingProduct, price_xl: txt })}

                        keyboardType="numeric"

                        placeholder="e.g. 32.00"

                        placeholderTextColor="#89726F"

                        style={styles.adminLoginInput}

                      />

                    </View>



                    <View style={{ gap: 4 }}>

                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>PRICE FOR XXL *</Text>

                      <TextInput

                        value={editingProduct.price_xxl !== undefined && editingProduct.price_xxl !== null ? String(editingProduct.price_xxl) : ''}

                        onChangeText={(txt) => setEditingProduct({ ...editingProduct, price_xxl: txt })}

                        keyboardType="numeric"

                        placeholder="e.g. 35.00"

                        placeholderTextColor="#89726F"

                        style={styles.adminLoginInput}

                      />

                    </View>

                  </>

                ) : (

                  <View style={{ gap: 4 }}>

                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>UNIT PRICE *</Text>

                    <TextInput

                      value={editingProduct.price !== undefined && editingProduct.price !== null ? String(editingProduct.price) : ''}

                      onChangeText={(txt) => setEditingProduct({ ...editingProduct, price: txt })}

                      keyboardType="numeric"

                      placeholder="e.g. 35.00"

                      placeholderTextColor="#89726F"

                      style={styles.adminLoginInput}

                    />

                  </View>

                )}



                <View style={{ gap: 4 }}>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>CATEGORY / CHIP *</Text>

                  <TextInput

                    value={editingProduct.categoryLabel}

                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, categoryLabel: txt, tag: txt })}

                    placeholder="e.g. Cow And Beef"

                    placeholderTextColor="#89726F"

                    style={styles.adminLoginInput}

                  />

                </View>



                <View style={{ gap: 4 }}>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>TAG / LABEL</Text>

                  <TextInput

                    value={editingProduct.tag}

                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, tag: txt })}

                    placeholder="e.g. Best Seller"

                    placeholderTextColor="#89726F"

                    style={styles.adminLoginInput}

                  />

                </View>



                <View style={{ gap: 4 }}>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>DESCRIPTION *</Text>

                  <TextInput

                    value={editingProduct.description}

                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, description: txt })}

                    multiline={true}

                    numberOfLines={2}

                    placeholder="Describe product..."

                    placeholderTextColor="#89726F"

                    style={[styles.adminLoginInput, { height: 60, textAlignVertical: 'top' }]}

                  />

                </View>



                <View style={{ gap: 4 }}>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>IMAGE URL</Text>

                  <TextInput

                    value={editingProduct.image}

                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, image: txt })}

                    placeholder="Image URL"

                    placeholderTextColor="#89726F"

                    style={styles.adminLoginInput}

                  />

                </View>



                <View style={{ gap: 4 }}>

                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.secondary, letterSpacing: 0.8 }}>CURRENT STOCK ({editingProduct.hasWeights ? 'KG' : 'UNITS'})</Text>

                  <TextInput

                    value={editingProduct.stock_quantity}

                    onChangeText={(txt) => setEditingProduct({ ...editingProduct, stock_quantity: txt })}

                    keyboardType="numeric"

                    placeholder="e.g. 50"

                    placeholderTextColor="#89726F"

                    style={styles.adminLoginInput}

                  />

                </View>



                <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(27,28,28,0.1)', paddingTop: 14, marginTop: 8, flexDirection: 'row', gap: 10 }}>

                  <Pressable 

                    onPress={() => {

                      setEditProductModalVisible(false);

                      setEditingProduct(null);

                    }}

                    style={{ flex: 1, borderWidth: 1, borderColor: palette.oxblood, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' }}

                  >

                    <Text style={{ color: palette.oxblood, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>CANCEL</Text>

                  </Pressable>

                  

                  <Pressable 

                    onPress={adminEditProduct}

                    style={{ flex: 1, backgroundColor: palette.oxblood, paddingVertical: 12, alignItems: 'center' }}

                  >

                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>SAVE CHANGES</Text>

                  </Pressable>

                </View>

              </ScrollView>

            </View>

          )}

        </View>

      </Modal>



      {/* AUTH MODAL */}

      <Modal visible={authModalVisible} animationType="slide" transparent={true} onRequestClose={() => setAuthModalVisible(false)}>

        <View style={{

          flex: 1,

          backgroundColor: 'rgba(0,0,0,0.55)',

          justifyContent: isPhoneScreen ? 'flex-end' : 'center',

          alignItems: isPhoneScreen ? 'stretch' : 'center',

          padding: isPhoneScreen ? 0 : 20

        }}>

          <View style={{

            backgroundColor: '#FAFAFA',

            borderTopLeftRadius: 20,

            borderTopRightRadius: 20,

            borderBottomLeftRadius: isPhoneScreen ? 0 : 20,

            borderBottomRightRadius: isPhoneScreen ? 0 : 20,

            width: isPhoneScreen ? '100%' : 480,

            maxHeight: '92%',

            overflow: 'hidden',

            borderWidth: isPhoneScreen ? 0 : 1,

            borderColor: 'rgba(74,4,4,0.15)',

          }}>



            {/* Brand Header */}

            <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, backgroundColor: '#FFF', position: 'relative' }}>

              <Pressable onPress={() => setAuthModalVisible(false)} style={{ position: 'absolute', left: 24, top: 20, zIndex: 10, padding: 4 }}>

                <Text style={{ fontSize: 24, color: palette.charcoal, fontWeight: '300' }}>✕</Text>

              </Pressable>

              <Text style={{ fontFamily: 'Georgia', fontSize: 32, fontWeight: '700', color: palette.oxblood, marginLeft: 36, lineHeight: 34 }}>

                Prolyn Wear

              </Text>

            </View>



            {/* Header Info */}

            <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, backgroundColor: '#FAFAFA' }}>

              <Text style={{ fontFamily: 'Georgia', fontSize: 25, fontWeight: '700', color: palette.oxblood, lineHeight: 28 }}>

                {isLoginMode ? 'Welcome Back' : 'Create an Account'}

              </Text>

              <Text style={{ fontSize: 13, color: palette.secondary, marginTop: 6, lineHeight: 18 }}>

                {isLoginMode ? 'Sign in to access your orders and account.' : 'Join Prolyn Wear for a seamless shopping experience.'}

              </Text>

            </View>



            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>



              {/* Full Name — sign up only */}

              {!isLoginMode && (

                <View style={{ marginBottom: 18 }}>

                  <Text style={{ fontSize: 12, fontWeight: '600', color: palette.charcoal, marginBottom: 4 }}>Full Name</Text>

                  <TextInput

                    value={authName}

                    onChangeText={setAuthName}

                    placeholder="Elias Thorne"

                    placeholderTextColor="#D8D8D8"

                    style={{

                      borderBottomWidth: 1,

                      borderBottomColor: '#E0E0E0',

                      paddingVertical: 6,

                      fontSize: 14,

                      color: palette.charcoal,

                    }}

                  />

                </View>

              )}



              {/* Email */}

              <View style={{ marginBottom: 18 }}>

                <Text style={{ fontSize: 12, fontWeight: '600', color: palette.charcoal, marginBottom: 4 }}>Email Address</Text>

                <TextInput

                  value={authEmail}

                  onChangeText={setAuthEmail}

                  placeholder="elias@heritage.com"

                  placeholderTextColor="#D8D8D8"

                  keyboardType="email-address"

                  autoCapitalize="none"

                  style={{

                    borderBottomWidth: 1,

                    borderBottomColor: '#E0E0E0',

                    paddingVertical: 6,

                    fontSize: 14,

                    color: palette.charcoal,

                  }}

                />

              </View>



              {/* Password */}

              <View style={{ marginBottom: 28 }}>

                <Text style={{ fontSize: 12, fontWeight: '600', color: palette.charcoal, marginBottom: 4 }}>Password</Text>

                <TextInput

                  value={authPassword}

                  onChangeText={setAuthPassword}

                  placeholder="••••••••"

                  placeholderTextColor="#D8D8D8"

                  secureTextEntry={true}

                  style={{

                    borderBottomWidth: 1,

                    borderBottomColor: '#E0E0E0',

                    paddingVertical: 6,

                    fontSize: 14,

                    color: palette.charcoal,

                  }}

                />

              </View>



              {/* Submit Button */}

              <Pressable

                onPress={handleAuth}

                disabled={authLoading}

                style={{

                  backgroundColor: authLoading ? '#8B4444' : palette.oxblood,

                  paddingVertical: 16,

                  alignItems: 'center',

                  marginBottom: 24,

                }}

              >

                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13, letterSpacing: 1 }}>

                  {authLoading ? 'PLEASE WAIT...' : (isLoginMode ? 'Sign In' : 'Create Your Account')}

                </Text>

              </Pressable>



              {/* Social Divider */}

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>

                <View style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />

                <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 1, paddingHorizontal: 12 }}>

                  {isLoginMode ? 'OR SIGN IN WITH' : 'OR REGISTER WITH'}

                </Text>

                <View style={{ flex: 1, height: 1, backgroundColor: '#E0E0E0' }} />

              </View>



              {/* Social Buttons */}

              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>

                <Pressable

                  onPress={() => alert('Social Sign In with Apple coming soon')}

                  style={{

                    flex: 1,

                    flexDirection: 'row',

                    alignItems: 'center',

                    justifyContent: 'center',

                    gap: 8,

                    borderWidth: 1,

                    borderColor: '#E0E0E0',

                    paddingVertical: 12,

                    backgroundColor: '#FFF',

                    borderRadius: 6,

                  }}

                >

                  <FontAwesome name="apple" size={16} color="#000" />

                  <Text style={{ fontWeight: '600', fontSize: 13, color: '#000' }}>Apple</Text>

                </Pressable>

                

                <Pressable

                  onPress={() => alert('Social Sign In with Google coming soon')}

                  style={{

                    flex: 1,

                    flexDirection: 'row',

                    alignItems: 'center',

                    justifyContent: 'center',

                    gap: 8,

                    borderWidth: 1,

                    borderColor: '#E0E0E0',

                    paddingVertical: 12,

                    backgroundColor: '#FFF',

                    borderRadius: 6,

                  }}

                >

                  <FontAwesome name="google" size={16} color="#000" />

                  <Text style={{ fontWeight: '600', fontSize: 13, color: '#000' }}>Google</Text>

                </Pressable>

              </View>



              {/* Toggle Link */}

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>

                <Text style={{ color: palette.secondary, fontSize: 13 }}>

                  {isLoginMode ? "Don't have an account?  " : 'Already have an account?  '}

                </Text>

                <Pressable onPress={() => { setIsLoginMode(!isLoginMode); setAuthInterests([]); }}>

                  <Text style={{ color: palette.oxblood, fontSize: 13, fontWeight: '700' }}>

                    {isLoginMode ? 'Sign Up' : 'Sign In'}

                  </Text>

                </Pressable>

              </View>



            </ScrollView>

          </View>

        </View>

      </Modal>



      {/* USER ACCOUNT BOTTOM SHEET */}

      <Modal visible={userAccountSheetVisible} animationType="slide" transparent={true} onRequestClose={() => setUserAccountSheetVisible(false)}>

        <Pressable 

          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}

          onPress={() => setUserAccountSheetVisible(false)}

        >

          <Pressable 

            style={{ 

              backgroundColor: isUserDarkMode ? darkPalette.background : '#FFF', 

              borderTopLeftRadius: 20, 

              borderTopRightRadius: 20,

              paddingBottom: 40,

              maxHeight: '80%'

            }}

            onPress={(e) => e.stopPropagation()}

          >

            <View style={{ 

              padding: 20, 

              borderBottomWidth: 1, 

              borderBottomColor: isUserDarkMode ? '#333' : '#E0E0E0' 

            }}>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                <View style={{ flex: 1 }}>

                  <Text style={{ 

                    fontSize: 22, 

                    fontWeight: '700', 

                    color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood 

                  }}>My Account</Text>

                  <Text style={{ 

                    fontSize: 14, 

                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                    marginTop: 4 

                  }}>

                    {user?.user_metadata?.full_name || user?.email || 'Guest'}

                  </Text>

                </View>

                

                {/* Dark Mode Toggle */}

                <Pressable

                  onPress={() => setIsUserDarkMode(!isUserDarkMode)}

                  style={{

                    flexDirection: 'row',

                    alignItems: 'center',

                    backgroundColor: isUserDarkMode ? darkPalette.surface : palette.surface,

                    paddingHorizontal: 10,

                    paddingVertical: 6,

                    borderRadius: 20,

                    borderWidth: 1,

                    borderColor: isUserDarkMode ? '#333' : '#E0E0E0',

                    gap: 6,

                    marginRight: 12,

                  }}

                >

                  <FontAwesome5 

                    name={isUserDarkMode ? 'sun' : 'moon'} 

                    size={14} 

                    color={isUserDarkMode ? '#FDB813' : '#4A0404'} 

                  />

                  <Text style={{

                    fontSize: 11,

                    fontWeight: '600',

                    color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal,

                  }}>

                    {isUserDarkMode ? 'Light' : 'Dark'}

                  </Text>

                </Pressable>

                

                <Pressable onPress={() => setUserAccountSheetVisible(false)}>

                  <FontAwesome name="times" size={24} color={isUserDarkMode ? '#B0B0B0' : '#888'} />

                </Pressable>

              </View>

            </View>



            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>

              <View style={{ padding: 20 }}>

                <Text style={{ 

                  fontSize: 16, 

                  fontWeight: '700', 

                  color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood, 

                  marginBottom: 12 

                }}>

                  Order History

                </Text>

                

                {customerOrdersLoading ? (

                  <Text style={{ 

                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                    textAlign: 'center', 

                    paddingVertical: 20 

                  }}>

                    Loading orders...

                  </Text>

                ) : customerOrders.length > 0 ? (

                  customerOrders.map(order => (

                    <View 

                      key={order.id} 

                      style={{ 

                        backgroundColor: isUserDarkMode ? darkPalette.surface : palette.background, 

                        padding: 14, 

                        borderRadius: 8,

                        marginBottom: 12,

                        borderWidth: 1,

                        borderColor: isUserDarkMode ? '#333' : '#E0E0E0'

                      }}

                    >

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>

                        <Text style={{ 

                          fontSize: 13, 

                          fontWeight: '700', 

                          color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood 

                        }}>

                          Order #{order.id.substring(0, 8)}

                        </Text>

                        <Text style={{ 

                          fontSize: 12, 

                          color: isUserDarkMode ? darkPalette.secondary : palette.secondary 

                        }}>

                          {new Date(order.created_at).toLocaleDateString()}

                        </Text>

                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>

                        <Text style={{ 

                          fontSize: 12, 

                          color: isUserDarkMode ? darkPalette.secondary : palette.secondary 

                        }}>Status: {order.status}</Text>

                        <Text style={{ 

                          fontSize: 13, 

                          fontWeight: '700', 

                          color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal 

                        }}>

                          {formatMoney(order.total, currency)}

                        </Text>

                      </View>

                      

                      {/* Product Images */}

                      {order.order_items && order.order_items.length > 0 && (

                        <View style={{ 

                          marginTop: 12, 

                          borderTopWidth: 1, 

                          borderTopColor: isUserDarkMode ? '#333' : '#E0E0E0', 

                          paddingTop: 12 

                        }}>

                          <Text style={{ 

                            fontSize: 11, 

                            fontWeight: '700', 

                            color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                            marginBottom: 8, 

                            letterSpacing: 0.5 

                          }}>

                            ITEMS ({order.order_items.length})

                          </Text>

                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>

                            {order.order_items.map((item, idx) => {

                              // Try to get product from order_items join first, then fallback to productCards

                              const product = productCards.find(p => p.id === item.product_id);

                              const imageUrl = item.product_image || product?.image || 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=200&q=80';

                              const productName = item.product_name || product?.name || 'Product';

                              

                              return (

                                <View key={idx} style={{ alignItems: 'center', width: 70 }}>

                                  <Image 

                                    source={{ uri: imageUrl }} 

                                    style={{ 

                                      width: 60, 

                                      height: 60, 

                                      borderRadius: 8, 

                                      backgroundColor: isUserDarkMode ? '#2A2A2A' : '#f5f5f5', 

                                      borderWidth: 1, 

                                      borderColor: isUserDarkMode ? '#444' : 'rgba(0,0,0,0.08)' 

                                    }} 

                                    resizeMode="cover"

                                  />

                                  <Text 

                                    style={{ 

                                      fontSize: 10, 

                                      color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal, 

                                      marginTop: 4, 

                                      fontWeight: '600',

                                      textAlign: 'center'

                                    }}

                                    numberOfLines={2}

                                  >

                                    {productName}

                                  </Text>

                                  <Text style={{ 

                                    fontSize: 9, 

                                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                                    marginTop: 2 

                                  }}>

                                    Qty: {item.quantity}

                                  </Text>

                                </View>

                              );

                            })}

                          </ScrollView>

                        </View>

                      )}

                    </View>

                  ))

                ) : (

                  <Text style={{ 

                    color: isUserDarkMode ? darkPalette.secondary : palette.secondary, 

                    textAlign: 'center', 

                    paddingVertical: 20 

                  }}>

                    No orders yet. Start shopping!

                  </Text>

                )}

              </View>

            </ScrollView>



            <View style={{ 

              padding: 20, 

              borderTopWidth: 1, 

              borderTopColor: isUserDarkMode ? '#333' : '#E0E0E0' 

            }}>

              <Pressable

                style={{

                  backgroundColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood,

                  paddingVertical: 14,

                  borderRadius: 8,

                  alignItems: 'center'

                }}

                onPress={async () => {

                  await supabase.auth.signOut();

                  setUser(null);

                  setCustomerName('');

                  setCustomerEmail('');

                  setUserAccountSheetVisible(false);

                  setCurrentPage('shop');

                }}

              >

                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14, letterSpacing: 1 }}>

                  SIGN OUT

                </Text>

              </Pressable>

            </View>

          </Pressable>

        </Pressable>

      </Modal>



      {/* Product Detail Modal */}

      <ProductDetail

        product={selectedProduct}

        visible={productDetailVisible}

        onClose={() => {

          setProductDetailVisible(false);

          setSelectedProduct(null);

        }}

        onAddToCart={(product, selectedWeight, itemPrice, quantity) => {

          addToCart(product, selectedWeight, itemPrice, quantity);

        }}

        onSetCartQuantity={(product, selectedWeight, itemPrice, quantity) => {

          setCartQuantity(product, selectedWeight, itemPrice, quantity);

        }}

        cartItems={cartItems}

        isUserDarkMode={isUserDarkMode}

      />

      {/* Floating social column — desktop/tablet only, fixed to right edge, hidden on Shop/Services/About/Blogs pages */}
      {!isPhoneScreen && !['shop', 'services', 'about', 'blogs'].includes(currentPage) && <FloatingSocialColumn />}

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safeArea: {

    flex: 1,

    backgroundColor: palette.background,

  },

  header: {

    height: 60,

    paddingHorizontal: 20,

    borderBottomWidth: 1,

    borderBottomColor: 'rgba(27, 28, 28, 0.1)',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    backgroundColor: palette.background,

    zIndex: 1000,

    elevation: 1000,

    overflow: 'visible',

  },

  headerLeft: {

    flex: 1,

  },

  headerLeftMobile: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 16,

    flex: 1,

  },

  headerCenter: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,

  },

  headerRight: {

    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'flex-end',

    gap: 12,

    overflow: 'visible',

  },

  headerBrand: {

    fontSize: 18,

    fontWeight: '700',

    letterSpacing: 2,

  },

  headerLogo: {

    width: 180,

    height: 60,

  },

  socialIcons: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

    flexWrap: 'nowrap',

    backgroundColor: '#e1e2e2',

    paddingHorizontal: 12,

    paddingVertical: 8,

    borderRadius: 8,

  },

  socialIcon: {

    padding: 4,

  },

  socialIconImage: {

    width: 32,

    height: 32,

  },

  hamburgerButton: {

    padding: 10,

    minWidth: 44,

    minHeight: 44,

    justifyContent: 'center',

    alignItems: 'center',

  },

  mobileMenuBackdrop: {

    flex: 1,

    backgroundColor: 'rgba(0, 0, 0, 0.5)',

    justifyContent: 'flex-end',

  },

  mobileMenuDrawer: {

    width: 300,

    height: '100%',

    backgroundColor: '#FFFFFF',

    elevation: 10,

    shadowColor: '#000',

    shadowOffset: { width: -2, height: 0 },

    shadowOpacity: 0.25,

    shadowRadius: 10,

  },

  mobileMenuHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    padding: 20,

    borderBottomWidth: 1,

    borderBottomColor: 'rgba(27, 28, 28, 0.1)',

  },

  mobileMenuTitle: {

    fontSize: 20,

    fontWeight: '700',

    color: '#1B1C1C',

  },

  mobileMenuClose: {

    padding: 8,

  },

  mobileMenuContent: {

    flex: 1,

    padding: 8,

  },

  mobileMenuItem: {

    paddingVertical: 16,

    paddingHorizontal: 16,

    borderBottomWidth: 1,

    borderBottomColor: 'rgba(27, 28, 28, 0.05)',

  },

  mobileMenuItemRow: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

  },

  mobileMenuItemText: {

    fontSize: 16,

    fontWeight: '500',

  },

  mobileSubmenu: {

    backgroundColor: '#F5F5F5',

  },

  mobileSubmenuItem: {

    paddingVertical: 12,

    paddingHorizontal: 24,

    borderBottomWidth: 1,

    borderBottomColor: 'rgba(27, 28, 28, 0.05)',

  },

  mobileSubmenuItemText: {

    fontSize: 14,

    fontWeight: '400',

  },

  mobileSocialIcons: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    flexWrap: 'wrap',

    gap: 14,

    paddingVertical: 24,

    paddingHorizontal: 16,

    borderTopWidth: 1,

    borderTopColor: 'rgba(27, 28, 28, 0.1)',

  },

  headerActions: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

  },

  currencyBtn: {

    borderWidth: 1,

    borderColor: palette.oxblood,

    paddingHorizontal: 12,

    paddingVertical: 6,

    backgroundColor: '#fff',

  },

  currencyBtnText: {

    color: palette.oxblood,

    fontSize: 11,

    fontWeight: '700',

    letterSpacing: 1,

  },

  navLink: {

    fontSize: 14,

    fontWeight: '400',

  },

  servicesDropdown: {

    position: 'absolute',

    top: 40,

    left: 0,

    minWidth: 180,

    borderWidth: 1,

    borderRadius: 8,

    paddingVertical: 8,

    paddingHorizontal: 12,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.1,

    shadowRadius: 8,

    elevation: 5,

    zIndex: 1000,

  },

  dropdownItem: {

    paddingVertical: 10,

    paddingHorizontal: 4,

  },

  dropdownItemText: {

    fontSize: 13,

    fontWeight: '400',

    color: '#28A745',

  },

  headerActionBtn: {

    borderWidth: 1,

    borderColor: palette.oxblood,

    paddingHorizontal: 12,

    paddingVertical: 6,

  },

  headerActionText: {

    color: palette.oxblood,

    fontSize: 11,

    fontWeight: '700',

    letterSpacing: 1,

  },

  headerIcon: {

    color: palette.oxblood,

    fontSize: 13,

    textTransform: 'uppercase',

    letterSpacing: 1,

    fontWeight: '700',

  },

  headerTitle: {

    color: palette.oxblood,

    fontSize: 20,

    fontWeight: '700',

    letterSpacing: -0.6,

  },

  badgeWrap: {

    position: 'relative',

  },

  badge: {

    position: 'absolute',

    top: -8,

    right: -10,

    width: 18,

    height: 18,

    borderRadius: 9,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: palette.oxbloodSoft,

  },

  badgeText: {

    color: '#fff',

    fontSize: 10,

    fontWeight: '700',

  },

  content: {

    paddingBottom: 40,

  },

  hero: {

    height: 510,

    margin: 16,

    backgroundColor: palette.oxblood,

    overflow: 'hidden',

    justifyContent: 'flex-end',

  },

  heroImage: {

    ...StyleSheet.absoluteFillObject,

    width: '100%',

    height: '100%',

    opacity: 0.72,

  },

  heroOverlay: {

    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'rgba(33, 0, 0, 0.35)',

  },

  heroTextWrap: {

    padding: 20,

  },

  kicker: {

    color: palette.oxbloodSoft,

    fontSize: 12,

    letterSpacing: 1.8,

    fontWeight: '700',

    marginBottom: 10,

  },

  heroTitle: {

    color: '#fff',

    fontSize: 40,

    lineHeight: 44,

    fontWeight: '700',

    letterSpacing: -1,

  },

  heroBody: {

    marginTop: 12,

    color: 'rgba(255,255,255,0.84)',

    fontSize: 16,

    lineHeight: 24,

    maxWidth: 320,

  },

  heroBtn: {

    marginTop: 24,

    alignSelf: 'flex-start',

    backgroundColor: palette.oxbloodSoft,

    paddingHorizontal: 18,

    paddingVertical: 12,

  },

  heroActionsRow: {

    marginTop: 24,

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 10,

  },

  heroBtnText: {

    color: '#fff',

    fontSize: 12,

    letterSpacing: 1.4,

    fontWeight: '700',

  },

  heroOutlineBtn: {

    borderWidth: 1,

    borderColor: '#fff',

    paddingHorizontal: 18,

    paddingVertical: 12,

  },

  heroOutlineBtnText: {

    color: '#fff',

    fontSize: 12,

    letterSpacing: 1.4,

    fontWeight: '700',

  },

  chipRow: {

    paddingHorizontal: 16,

    paddingVertical: 4,

    gap: 10,

  },

  chipsScrollView: {

    marginTop: 8,

    marginBottom: 4,

  },

  chipsScrollContent: {

    paddingHorizontal: 16,

    paddingVertical: 8,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,

  },

  chipGridItem: {

    minHeight: 34,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.18)',

    borderRadius: 999,

    paddingHorizontal: 16,

    paddingVertical: 8,

    backgroundColor: 'transparent',

    alignItems: 'center',

    justifyContent: 'center',

  },

  chip: {

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.2)',

    borderRadius: 999,

    paddingHorizontal: 18,

    paddingVertical: 10,

  },

  chipActive: {

    backgroundColor: '#ffffff',

    borderColor: '#18477a',

  },

  chipText: {

    color: palette.secondary,

    fontSize: 12,

    fontWeight: '700',

    textAlign: 'center',

  },

  chipTextActive: {

    color: '#296416',

  },

  productGrid: {

    flexDirection: 'row',

    flexWrap: 'wrap',

  },

  productCard: {

    backgroundColor: palette.surface,

    borderWidth: 0,

    borderColor: 'transparent',

    padding: 0,

  },

  imageWrap: {

    backgroundColor: '#FFF',

    marginBottom: 12,

    overflow: 'hidden',

    flexDirection: 'column',

    // 4:5 portrait ratio — height = width × 1.25; capped so desktop cards
    // don't produce enormous image areas with 4-column layout
    aspectRatio: 4 / 5,

    maxHeight: 280,

  },

  productImage: {

    width: '90%',

    height: '90%',

  },

  cardSignatureLogo: {

    position: 'absolute',

    bottom: 8,

    left: 8,

    // width/height driven by inline style relative to cardWidth

  },

  cardImageContainer: {

    flex: 1,

    backgroundColor: '#FFF',

    justifyContent: 'center',

    alignItems: 'center',

    width: '100%',

    position: 'relative',

  },

  cartIconSquare: {

    position: 'absolute',

    bottom: 8,

    right: 8,

    backgroundColor: '#FFFFFF',

    width: 50,

    height: 50,

    borderRadius: 25,

    justifyContent: 'center',

    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.2,

    shadowRadius: 3,

    elevation: 4,

  },

  cartIconSquareSelected: {

    backgroundColor: '#ad7a32',

  },

  rowBetween: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'flex-start',

    gap: 12,

    marginBottom: 2,

  },

  productName: {

    flex: 1,

    fontSize: 24,

    lineHeight: 28,

    color: palette.oxblood,

    fontWeight: '700',

    fontFamily: 'Georgia',

  },

  productPrice: {

    fontSize: 20,

    color: palette.charcoal,

    fontWeight: '700',

    fontFamily: 'Georgia',

  },

  priceUnit: {

    marginTop: 4,

    marginBottom: 8,

    color: palette.secondary,

    fontSize: 11,

  },

  categoryDescription: {

    color: palette.secondary,

    fontSize: 13,

    lineHeight: 19,

    marginBottom: 12,

  },

  weightWrap: {

    marginTop: 2,

  },

  weightLabel: {

    color: palette.secondary,

    fontSize: 11,

    letterSpacing: 1.2,

    fontWeight: '700',

    marginBottom: 8,

  },

  weightOptionsRow: {

    flexDirection: 'row',

    alignItems: 'center',

    overflow: 'hidden',

  },

  weightOption: {

    flex: 1,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.12)',

    backgroundColor: '#FFF',

    paddingVertical: 10,

    alignItems: 'center',

    justifyContent: 'center',

  },

  weightOptionActive: {

    backgroundColor: palette.vault,

    borderColor: palette.vault,

  },

  weightOptionText: {

    color: palette.secondary,

    fontSize: 12,

    letterSpacing: 0.4,

    fontWeight: '700',

  },

  weightOptionTextActive: {

    color: '#fff',

  },

  addBtn: {

    marginTop: 14,

    borderWidth: 1,

    borderColor: palette.oxblood,

    paddingVertical: 13,

    alignItems: 'center',

    backgroundColor: '#FFF',

  },

  addBtnText: {

    color: palette.oxblood,

    letterSpacing: 1.8,

    fontWeight: '700',

    fontSize: 12,

  },

  cartPanel: {

    position: 'absolute',

    left: 16,

    right: 16,

    bottom: 164,

    maxHeight: 200,

    backgroundColor: '#FFF',

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.12)',

    padding: 14,

  },

  cartPanelHeader: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',

    marginBottom: 10,

  },

  cartPanelLabel: {

    color: palette.secondary,

    fontSize: 10,

    letterSpacing: 1.2,

    fontWeight: '700',

  },

  cartPanelTitle: {

    color: palette.charcoal,

    fontSize: 16,

    fontWeight: '700',

    marginTop: 2,

  },

  cartPanelTotal: {

    color: palette.oxblood,

    fontSize: 22,

    fontWeight: '700',

    fontFamily: 'Georgia',

  },

  cartList: {

    maxHeight: 150,

  },

  cartRow: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingVertical: 10,

    borderTopWidth: 1,

    borderTopColor: 'rgba(27,28,28,0.08)',

  },

  cartRowTextWrap: {

    flex: 1,

    paddingRight: 10,

  },

  cartRowTop: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,

  },

  cartRowImage: {

    width: 72,

    height: 72,

    backgroundColor: '#EEECEC',

  },

  cartRowCopy: {

    flex: 1,

  },

  cartRowName: {

    color: palette.charcoal,

    fontSize: 14,

    fontWeight: '700',

  },

  cartRowMeta: {

    color: palette.secondary,

    fontSize: 11,

    marginTop: 2,

  },

  cartRowControls: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,

  },

  cartStepButton: {

    width: 30,

    height: 30,

    borderRadius: 15,

    borderWidth: 1,

    borderColor: palette.oxblood,

    alignItems: 'center',

    justifyContent: 'center',

  },

  cartStepButtonText: {

    color: palette.oxblood,

    fontSize: 18,

    fontWeight: '700',

    lineHeight: 18,

  },

  cartQuantity: {

    minWidth: 18,

    textAlign: 'center',

    color: palette.charcoal,

    fontWeight: '700',

  },

  cartPageContent: {

    paddingBottom: 120,

    backgroundColor: palette.background,

  },

  adminPageContent: {

    paddingBottom: 130,

    backgroundColor: palette.background,

  },

  adminLoginContent: {

    flexGrow: 1,

    paddingHorizontal: 16,

    paddingVertical: 24,

    justifyContent: 'center',

    backgroundColor: palette.background,

  },

  adminLoginCard: {

    backgroundColor: '#fff',

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.14)',

    padding: 18,

  },

  adminLoginTitle: {

    color: palette.charcoal,

    fontSize: 28,

    lineHeight: 32,

    fontWeight: '700',

    fontFamily: 'Georgia',

    marginTop: 6,

  },

  adminLoginBody: {

    marginTop: 10,

    color: palette.secondary,

    fontSize: 14,

    lineHeight: 20,

    marginBottom: 18,

  },

  adminLoginField: {

    marginBottom: 14,

  },

  adminLoginLabel: {

    color: palette.secondary,

    fontSize: 11,

    letterSpacing: 1,

    fontWeight: '700',

    marginBottom: 8,

  },

  adminLoginInput: {

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.18)',

    backgroundColor: '#FFF',

    paddingHorizontal: 14,

    paddingVertical: 12,

    color: palette.charcoal,

    fontSize: 15,

  },

  adminLoginButton: {

    backgroundColor: palette.oxblood,

    paddingVertical: 13,

    alignItems: 'center',

    marginTop: 6,

  },

  adminLoginButtonText: {

    color: '#fff',

    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1.4,

  },

  adminLoginCancelButton: {

    marginTop: 12,

    alignItems: 'center',

    paddingVertical: 10,

  },

  adminLoginCancelText: {

    color: palette.oxblood,

    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1.2,

  },

  adminHero: {

    margin: 16,

    padding: 18,

    backgroundColor: palette.oxblood,

  },

  adminTitle: {

    color: '#fff',

    fontSize: 28,

    lineHeight: 32,

    fontWeight: '700',

    fontFamily: 'Georgia',

  },

  adminStatsGrid: {

    paddingHorizontal: 16,

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 12,

  },

  adminStatsGridCompact: {

    paddingHorizontal: 16,

    flexDirection: 'column',

  },

  adminStatCard: {

    width: '48%',

    backgroundColor: palette.surface,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.14)',

    padding: 14,

  },

  adminStatCardCompact: {

    width: '100%',

  },

  adminStatLabel: {

    color: palette.secondary,

    fontSize: 11,

    letterSpacing: 1,

    fontWeight: '700',

  },

  adminStatValue: {

    color: palette.oxblood,

    fontSize: 30,

    fontWeight: '700',

    fontFamily: 'Georgia',

    marginTop: 6,

  },

  adminStatNote: {

    color: palette.secondary,

    fontSize: 12,

    marginTop: 4,

  },

  adminSection: {

    marginTop: 18,

    marginHorizontal: 16,

  },

  productSummaryCard: {

    backgroundColor: '#fff',

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.14)',

    padding: 16,

  },

  productSummaryTopRow: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',

    gap: 12,

  },

  productSummaryTopRowCompact: {

    flexDirection: 'column',

  },

  productSummaryTitle: {

    color: palette.charcoal,

    fontSize: 18,

    fontWeight: '700',

    fontFamily: 'Georgia',

  },

  productSummaryBody: {

    marginTop: 4,

    color: palette.secondary,

    fontSize: 13,

    lineHeight: 19,

  },

  currencyPill: {

    backgroundColor: palette.oxblood,

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 999,

  },

  currencyPillText: {

    color: '#fff',

    fontSize: 11,

    fontWeight: '700',

    letterSpacing: 1,

  },

  productSummaryMetrics: {

    flexDirection: 'row',

    gap: 12,

    marginTop: 16,

  },

  productSummaryMetricsCompact: {

    flexDirection: 'column',

  },

  productSummaryMetric: {

    flex: 1,

    backgroundColor: palette.background,

    padding: 12,

  },

  productSummaryMetricCompact: {

    width: '100%',

  },

  productSummaryActions: {

    marginTop: 12,

    flexDirection: 'row',

  },

  productSummaryMetricLabel: {

    color: palette.secondary,

    fontSize: 11,

    letterSpacing: 1,

    fontWeight: '700',

  },

  productSummaryMetricValue: {

    color: palette.oxblood,

    fontSize: 24,

    fontWeight: '700',

    fontFamily: 'Georgia',

    marginTop: 6,

  },

  currencyRow: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 10,

  },

  currencyRowCompact: {

    gap: 8,

  },

  currencyOption: {

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.14)',

    backgroundColor: '#fff',

    paddingHorizontal: 12,

    paddingVertical: 10,

  },

  currencyOptionActive: {

    backgroundColor: palette.vault,

    borderColor: palette.vault,

  },

  currencyOptionText: {

    color: palette.secondary,

    fontSize: 12,

    fontWeight: '700',

  },

  currencyOptionTextActive: {

    color: '#fff',

  },

  adminSectionLabel: {

    color: palette.secondary,

    fontSize: 11,

    letterSpacing: 1.2,

    fontWeight: '700',

    marginBottom: 10,

  },

  syncNotice: {

    marginBottom: 12,

    paddingHorizontal: 14,

    paddingVertical: 10,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.12)',

    backgroundColor: '#fff',

  },

  syncNoticeText: {

    color: palette.secondary,

    fontSize: 12,

    fontWeight: '600',

  },

  syncNoticeError: {

    marginBottom: 12,

    paddingHorizontal: 14,

    paddingVertical: 10,

    borderWidth: 1,

    borderColor: 'rgba(74,4,4,0.18)',

    backgroundColor: 'rgba(210, 106, 95, 0.08)',

  },

  syncNoticeErrorText: {

    color: palette.oxblood,

    fontSize: 12,

    fontWeight: '600',

  },

  adminActionRow: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 10,

  },

  adminActionRowCompact: {

    flexDirection: 'column',

  },

  adminActionButton: {

    flexGrow: 1,

    flexBasis: '45%',

    backgroundColor: '#fff',

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.14)',

    paddingHorizontal: 14,

    paddingVertical: 10,

    alignItems: 'center',

  },

  adminActionButtonCompact: {

    flexBasis: '100%',

  },

  adminActionText: {

    color: palette.charcoal,

    fontSize: 12,

    fontWeight: '700',

    textAlign: 'center',

  },

  adminLogoutButton: {

    borderWidth: 1,

    borderColor: palette.oxblood,

    paddingVertical: 12,

    alignItems: 'center',

    backgroundColor: '#fff',

  },

  adminLogoutButtonText: {

    color: palette.oxblood,

    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1.2,

  },

  adminTable: {

    backgroundColor: '#fff',

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.14)',

  },

  adminTableRow: {

    padding: 14,

    borderTopWidth: 1,

    borderTopColor: 'rgba(27,28,28,0.08)',

    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-between',

    gap: 12,

  },

  adminTableRowCompact: {

    flexDirection: 'column',

  },

  adminRowCopy: {

    flex: 1,

  },

  adminRowTitle: {

    color: palette.charcoal,

    fontSize: 15,

    fontWeight: '700',

  },

  adminRowMeta: {

    marginTop: 4,

    color: palette.secondary,

    fontSize: 12,

    lineHeight: 18,

  },

  adminRowRight: {

    alignItems: 'flex-end',

  },

  adminRowRightCompact: {

    alignItems: 'flex-start',

  },

  adminRowPrice: {

    color: palette.oxblood,

    fontSize: 18,

    fontWeight: '700',

  },

  adminRowStatus: {

    marginTop: 4,

    color: palette.secondary,

    fontSize: 11,

    fontWeight: '700',

    textTransform: 'uppercase',

  },

  cartPageHero: {

    margin: 16,

    padding: 18,

    backgroundColor: palette.vault,

  },

  cartPageKicker: {

    color: palette.oxbloodSoft,

    fontSize: 11,

    letterSpacing: 1.8,

    fontWeight: '700',

    marginBottom: 8,

  },

  cartPageTitle: {

    color: '#fff',

    fontSize: 28,

    lineHeight: 32,

    fontWeight: '700',

    fontFamily: 'Georgia',

  },

  cartPageBody: {

    marginTop: 10,

    color: 'rgba(255,255,255,0.8)',

    fontSize: 14,

    lineHeight: 20,

  },

  cartPagePanel: {

    marginHorizontal: 16,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.12)',

    backgroundColor: '#FFF',

    padding: 14,

  },

  cartSummaryCard: {

    marginHorizontal: 16,

    marginTop: 14,

    marginBottom: 92,

    padding: 16,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.12)',

    backgroundColor: palette.vault,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    gap: 12,

  },

  cartSummaryLabel: {

    color: '#888989',

    fontSize: 10,

    letterSpacing: 1.2,

    fontWeight: '700',

  },

  cartSummaryValue: {

    color: '#fff',

    fontSize: 24,

    marginTop: 2,

    fontWeight: '700',

    fontFamily: 'Georgia',

  },

  searchWrap: {

    paddingHorizontal: 16,

    marginTop: 12,

    marginBottom: 8,

  },

  searchInput: {

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.2)',

    backgroundColor: '#FFFFFF',

    borderRadius: 8,

    paddingHorizontal: 14,

    paddingVertical: 0,

    height: 42,

    color: palette.charcoal,

    fontSize: 14,

  },

  emptyState: {

    width: '100%',

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.12)',

    padding: 16,

    marginBottom: 20,

  },

  emptyTitle: {

    color: palette.oxblood,

    fontSize: 18,

    fontWeight: '700',

    marginBottom: 4,

  },

  emptyBody: {

    color: palette.secondary,

    fontSize: 14,

    lineHeight: 20,

  },

  checkoutBar: {

    position: 'absolute',

    left: 16,

    right: 16,

    bottom: 90,

    zIndex: 500,

    backgroundColor: palette.vault,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.1)',

    paddingHorizontal: 20,

    paddingVertical: 14,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    borderRadius: 10,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.18,

    shadowRadius: 12,

    elevation: 8,

  },

  checkoutActions: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,

  },

  adminQuickButton: {

    backgroundColor: '#fff',

    borderWidth: 1,

    borderColor: palette.oxblood,

    paddingHorizontal: 14,

    paddingVertical: 9,

  },

  adminQuickButtonText: {

    color: palette.oxblood,

    fontSize: 11,

    fontWeight: '700',

    letterSpacing: 1.2,

  },

  checkoutLabel: {

    color: 'rgba(255,255,255,0.6)',

    fontSize: 10,

    letterSpacing: 1.2,

    fontWeight: '700',

    marginBottom: 3,

  },

  checkoutText: {

    color: '#fff',

    fontSize: 17,

    fontWeight: '600',

  },

  checkoutBtn: {

    backgroundColor: '#ad7a32',

    paddingHorizontal: 18,

    paddingVertical: 11,

    borderRadius: 8,

  },

  checkoutBtnText: {

    color: '#ffffff',

    letterSpacing: 1.2,

    fontSize: 11,

    fontWeight: '700',

  },

  cartNavButton: {

    flex: 1,

    marginHorizontal: 16,

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: 12,

    backgroundColor: palette.oxblood,

  },

  cartNavButtonText: {

  },

  navItem: {

    alignItems: 'center',

    gap: 6,

    flex: 0,

  },

  navIconCircle: {

    width: 40,

    height: 40,

    borderRadius: 20,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'transparent',

    padding: 2,

  },

  navIconCircleActive: {

    borderWidth: 2,

    borderColor: '#18477a',

  },

  navLabel: {

    color: '#636263',

    fontSize: 11,

    fontWeight: '600',

  },

  navLabelActive: {

    color: '#18477a',

  },



  bottomNav: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-around',

    height: 72,

    paddingHorizontal: 16,

    backgroundColor: palette.background,

    borderTopWidth: 1,

    borderTopColor: 'rgba(27, 28, 28, 0.1)',

  },



  adminDashboardLayout: {

    flex: 1,

    flexDirection: 'row',

    backgroundColor: '#FAF9F9',

  },

  adminSidebar: {

    width: 260,

    backgroundColor: '#F5F4F4',

    borderRightWidth: 1,

    borderRightColor: 'rgba(27,28,28,0.06)',

    paddingVertical: 32,

  },

  adminSidebarBrand: {

    fontFamily: 'Georgia',

    fontSize: 22,

    fontWeight: '700',

    color: '#1B1C1C',

    paddingHorizontal: 24,

    marginBottom: 40,

  },

  adminProfileBlock: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 24,

    marginBottom: 40,

    gap: 12,

  },

  adminAvatar: {

    width: 44,

    height: 44,

    borderRadius: 8,

    backgroundColor: '#D1D5DB',

  },

  adminProfileInfo: {

    flex: 1,

  },

  adminProfileName: {

    fontSize: 14,

    fontWeight: '500',

    color: '#1B1C1C',

  },

  adminProfileRole: {

    fontSize: 10,

    fontWeight: '700',

    color: '#888989',

    letterSpacing: 0.8,

    marginTop: 2,

  },

  adminNavList: {

    gap: 8,

  },

  adminNavItem: {

    paddingVertical: 12,

    paddingHorizontal: 24,

  },

  adminNavItemActive: {

    backgroundColor: '#270808',

  },

  adminNavText: {

    fontSize: 14,

    color: '#5F5E5F',

  },

  adminNavTextActive: {

    color: '#FFFFFF',

    fontWeight: '600',

  },

  adminNavListBottom: {

    gap: 8,

    borderTopWidth: 1,

    borderTopColor: 'rgba(27,28,28,0.06)',

    paddingTop: 16,

  },

  adminMainContent: {

    flex: 1,

    backgroundColor: '#FAF9F9',

  },

  adminMainScroll: {

    padding: 40,

    maxWidth: 1000,

  },

  adminTopHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    borderBottomWidth: 1,

    borderBottomColor: 'rgba(27,28,28,0.08)',

    paddingBottom: 24,

    marginBottom: 32,

  },

  adminMainTitle: {

    fontFamily: 'Georgia',

    fontSize: 32,

    fontWeight: '700',

    color: '#1B1C1C',

  },

  adminTopIcons: {

    flexDirection: 'row',

    gap: 16,

  },

  adminSectionSubTitle: {

    fontSize: 10,

    fontWeight: '700',

    color: '#888989',

    letterSpacing: 1.2,

    marginBottom: 8,

  },

  adminCurrencySection: {

    marginBottom: 32,

  },

  adminCurrencyToggleRow: {

    flexDirection: 'row',

    alignItems: 'center',

    flexWrap: 'wrap',

  },

  adminCurrencyToggle: {

    paddingVertical: 8,

    paddingHorizontal: 16,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.1)',

    backgroundColor: '#fff',

  },

  adminCurrencyToggleActive: {

    backgroundColor: '#270808',

    borderColor: '#270808',

  },

  adminCurrencyToggleText: {

    fontSize: 12,

    fontWeight: '600',

    color: '#5F5E5F',

  },

  adminCurrencyToggleTextActive: {

    color: '#fff',

  },

  adminStatCardsRow: {

    flexDirection: 'row',

    gap: 20,

    marginBottom: 48,

    flexWrap: 'wrap',

  },

  adminNewStatCard: {

    flex: 1,

    minWidth: 250,

    backgroundColor: '#fff',

    padding: 24,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.08)',

  },

  adminNewStatCardDark: {

    backgroundColor: '#2A0303',

    borderColor: '#2A0303',

    overflow: 'hidden',

  },

  adminNewStatCardHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 16,

  },

  adminNewStatLabel: {

    fontSize: 11,

    fontWeight: '700',

    color: '#5F5E5F',

    letterSpacing: 1,

  },

  adminBadgeGreen: {

    backgroundColor: '#ECFDF5',

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 4,

  },

  adminBadgeGreenText: {

    color: '#10B981',

    fontSize: 10,

    fontWeight: '700',

  },

  adminBadgeRed: {

    backgroundColor: '#FEF2F2',

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 4,

  },

  adminBadgeRedText: {

    color: '#EF4444',

    fontSize: 10,

    fontWeight: '700',

  },

  adminBadgeGray: {

    backgroundColor: '#F3F4F6',

    paddingHorizontal: 8,

    paddingVertical: 4,

    borderRadius: 4,

  },

  adminBadgeGrayText: {

    color: '#6B7280',

    fontSize: 10,

    fontWeight: '700',

  },

  adminNewStatValue: {

    fontFamily: 'Georgia',

    fontSize: 32,

    fontWeight: '700',

    color: '#1B1C1C',

    marginBottom: 8,

  },

  adminNewStatSub: {

    fontSize: 12,

    color: '#888989',

  },

  adminStatLine: {

    height: 4,

    backgroundColor: '#4A0404',

    width: 60,

    marginTop: 16,

  },

  adminDarkCardIcon: {

    position: 'absolute',

    right: -10,

    bottom: -20,

    fontSize: 120,

    opacity: 0.15,

  },

  adminDashboardSection: {

    marginBottom: 48,

  },

  adminDashboardSectionHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 24,

  },

  adminMainSubtitle: {

    fontFamily: 'Georgia',

    fontSize: 22,

    fontWeight: '700',

    color: '#1B1C1C',

    marginBottom: 16,

  },

  adminDarkButton: {

    backgroundColor: '#270808',

    paddingHorizontal: 16,

    paddingVertical: 10,

  },

  adminDarkButtonText: {

    color: '#fff',

    fontSize: 12,

    fontWeight: '600',

  },

  adminNewTable: {

    backgroundColor: '#fff',

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.08)',

  },

  adminNewTableHeader: {

    flexDirection: 'row',

    paddingVertical: 16,

    paddingHorizontal: 20,

    backgroundColor: '#F9F9F9',

    borderBottomWidth: 1,

    borderBottomColor: 'rgba(27,28,28,0.08)',

  },

  adminNewTableCol: {

    fontSize: 10,

    fontWeight: '700',

    color: '#888989',

    letterSpacing: 1,

  },

  adminNewTableRow: {

    flexDirection: 'row',

    paddingVertical: 16,

    paddingHorizontal: 20,

    borderBottomWidth: 1,

    borderBottomColor: 'rgba(27,28,28,0.04)',

    alignItems: 'center',

  },

  adminNewTableImage: {

    width: 48,

    height: 48,

    borderRadius: 4,

    backgroundColor: '#F0F0F0',

  },

  adminNewTableTitle: {

    fontFamily: 'Georgia',

    fontSize: 16,

    fontWeight: '700',

    color: '#1B1C1C',

  },

  adminNewTableText: {

    fontSize: 13,

    color: '#5F5E5F',

  },

  adminStatusBadgeGreen: {

    backgroundColor: '#ECFDF5',

    paddingHorizontal: 10,

    paddingVertical: 4,

    borderRadius: 12,

    alignSelf: 'flex-start',

  },

  adminStatusBadgeGreenText: {

    color: '#10B981',

    fontSize: 10,

    fontWeight: '600',

  },

  adminStatusBadgeRed: {

    backgroundColor: '#FEF2F2',

    paddingHorizontal: 10,

    paddingVertical: 4,

    borderRadius: 12,

    alignSelf: 'flex-start',

  },

  adminStatusBadgeRedText: {

    color: '#EF4444',

    fontSize: 10,

    fontWeight: '600',

  },

  adminEditIcon: {

    fontSize: 18,

    color: '#888989',

  },

  adminOrdersList: {

    gap: 16,

    marginBottom: 24,

  },

  adminNewOrderCard: {

    backgroundColor: '#fff',

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.08)',

    padding: 20,

  },

  adminOrderCardId: {

    fontSize: 13,

    color: '#5F5E5F',

    fontWeight: '500',

  },

  adminOrderCardUser: {

    fontFamily: 'Georgia',

    fontSize: 16,

    fontWeight: '700',

    color: '#1B1C1C',

  },

  adminOrderCardMeta: {

    fontSize: 12,

    color: '#888989',

    marginTop: 4,

  },

  adminOrderCardStatusBadge: {

    backgroundColor: '#F3F4F6',

    paddingHorizontal: 8,

    paddingVertical: 4,

    marginBottom: 8,

    borderRadius: 4,

  },

  adminOrderCardStatusText: {

    fontSize: 10,

    fontWeight: '700',

    color: '#4B5563',

    letterSpacing: 0.5,

  },

  adminOrderCardTotal: {

    fontFamily: 'Georgia',

    fontSize: 20,

    fontWeight: '700',

    color: '#1B1C1C',

  },

  adminOutlineButton: {

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.4)',

    paddingVertical: 14,

    alignItems: 'center',

    backgroundColor: '#FAF9F9',

  },

  adminOutlineButtonText: {

    fontSize: 12,

    fontWeight: '600',

    color: '#1B1C1C',

  },

  footerContainer: {

    backgroundColor: '#1B1C1C',

    paddingHorizontal: 24,

    paddingTop: 48,

    paddingBottom: 140, // Padding to clear bottom navigation tabs

    borderTopWidth: 1,

    borderTopColor: 'rgba(255,255,255,0.08)',

    marginTop: 48,

  },

  footerDesktopRow: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    flexWrap: 'wrap',

    gap: 24,

  },

  footerCol: {

    flex: 1,

    minWidth: 160,

    marginBottom: 20,

  },

  footerColHeader: {

    fontFamily: 'System',

    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',

    marginBottom: 16,

    letterSpacing: 1.2,

  },

  footerAboutText: {

    fontSize: 13,

    color: '#CCCCCC',

    lineHeight: 20,

  },

  footerLink: {

    fontSize: 13,

    color: '#B5B5B5',

    marginBottom: 12,

    lineHeight: 18,

  },

  contactRow: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 12,

    gap: 8,

  },

  contactIcon: {

    width: 18,

    textAlign: 'center',

  },

  contactLinkText: {

    fontSize: 13,

    color: '#B5B5B5',

    lineHeight: 18,

  },

  socialIconsRow: {

    flexDirection: 'row',

    alignItems: 'center',

    marginTop: 16,

    gap: 10,

  },

  socialCircle: {

    width: 32,

    height: 32,

    borderRadius: 16,

    backgroundColor: '#262626',

    justifyContent: 'center',

    alignItems: 'center',

  },

  footerAccordionContainer: {

    flexDirection: 'column',

  },

  accordionSection: {

    borderBottomWidth: 1,

    borderBottomColor: 'rgba(255,255,255,0.05)',

  },

  accordionHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    paddingVertical: 16,

  },

  accordionHeaderTitle: {

    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',

    letterSpacing: 1,

  },

  accordionHeaderSign: {

    fontSize: 18,

    fontWeight: '600',

    color: '#FFF',

  },

  accordionContent: {

    paddingTop: 4,

    paddingBottom: 16,

    paddingLeft: 8,

  },

  footerBottom: {

    borderTopWidth: 1,

    borderTopColor: 'rgba(255,255,255,0.05)',

    paddingTop: 24,

    marginTop: 24,

    alignItems: 'center',

  },

  copyrightText: {

    fontSize: 11,

    color: '#666',

  },

  bottomSheetBackdrop: {

    flex: 1,

    backgroundColor: 'rgba(27,28,28,0.5)',

    justifyContent: 'flex-end',

  },

  bottomSheetBackdropDismiss: {

    ...StyleSheet.absoluteFillObject,

  },

  bottomSheetContainer: {

    backgroundColor: palette.background,

    borderTopLeftRadius: 20,

    borderTopRightRadius: 20,

    padding: 24,

    maxHeight: '85%',

    width: '100%',

    maxWidth: 640,

    alignSelf: 'center',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: -4 },

    shadowOpacity: 0.1,

    shadowRadius: 12,

    elevation: 10,

    borderWidth: 1,

    borderColor: 'rgba(27,28,28,0.08)',

  },

  bottomSheetHandle: {

    width: 40,

    height: 4,

    borderRadius: 2,

    backgroundColor: '#DDD',

    alignSelf: 'center',

    marginBottom: 16,

  },

  bottomSheetHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 16,

  },

  bottomSheetTitle: {

    fontFamily: 'Georgia',

    fontSize: 22,

    fontWeight: '700',

    color: palette.oxblood,

    letterSpacing: 0.5,

  },

  bottomSheetCloseBtn: {

    fontSize: 20,

    color: palette.secondary,

    fontWeight: '300',

    padding: 4,

  },

  bottomSheetSummaryCard: {

    backgroundColor: palette.surface,

    borderWidth: 1,

    borderColor: 'rgba(74,4,4,0.1)',

    padding: 20,

    marginTop: 16,

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 2,

  },

  bottomSheetSummaryLabel: {

    color: palette.secondary,

    fontSize: 10,

    letterSpacing: 1.2,

    fontWeight: '700',

  },

  bottomSheetSummaryValue: {

    color: palette.oxblood,

    fontSize: 24,

    marginTop: 2,

    fontWeight: '700',

    fontFamily: 'Georgia',

  },

});

