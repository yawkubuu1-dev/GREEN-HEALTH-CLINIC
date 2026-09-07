import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, PanResponder, useWindowDimensions, Image } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Sample clinic/centers data
const CLINIC_CENTERS = [
  {
    id: 1,
    title: 'Heart Institute',
    description: 'Our state-of-the-art cardiac care center provides comprehensive heart services including diagnostics, interventional procedures, and cardiac rehabilitation with a team of renowned cardiologists.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    title: 'Diagnostic Center',
    description: 'Advanced imaging and laboratory services with cutting-edge technology for accurate and timely diagnosis. From MRI and CT scans to comprehensive blood work, we have it all.',
    image: 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    title: 'Orthopedic Clinic',
    description: 'Specialized care for bone and joint conditions including sports medicine, joint replacement surgery, physical therapy, and minimally invasive orthopedic procedures.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    title: 'Women\'s Health',
    description: 'Comprehensive women\'s healthcare services including obstetrics, gynecology, fertility treatments, and wellness programs tailored to women at every stage of life.',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 5,
    title: 'Pediatric Center',
    description: 'Child-friendly medical care with specialized pediatricians, neonatal intensive care, developmental assessments, and a supportive environment for children and families.',
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80',
  },
];

export default function ClinicCentersCoverflow() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(2); // Start with middle card
  const animatedIndex = useRef(new Animated.Value(2)).current;
  const isPhone = width <= 768;

  // Calculate card styles based on distance from center
  const getCardStyle = (index) => {
    const distance = index - activeIndex;
    const absDistance = Math.abs(distance);
    
    // Base styles
    const baseStyle = {
      width: isPhone ? 200 : 280,
      height: isPhone ? 320 : 420,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'absolute',
    };

    // Center card (active)
    if (distance === 0) {
      return {
        ...baseStyle,
        transform: [
          { scale: 1 },
          { translateX: 0 },
        ],
        opacity: 1,
        zIndex: 10,
      };
    }

    // Side cards
    const maxVisible = isPhone ? 1 : 2; // Show fewer cards on mobile
    if (absDistance > maxVisible) {
      return {
        ...baseStyle,
        opacity: 0,
        transform: [
          { scale: 0.8 },
          { translateX: distance > 0 ? 300 : -300 },
        ],
        zIndex: 0,
      };
    }

    // Visible side cards with 3D effect
    const rotation = distance * 25; // Degrees
    const scale = 0.85 - (absDistance * 0.1);
    const opacity = 0.7 - (absDistance * 0.2);
    const translateX = distance * (isPhone ? 140 : 200);

    return {
      ...baseStyle,
      transform: [
        { scale },
        { translateX },
        { rotateY: `${rotation}deg` },
      ],
      opacity,
      zIndex: 10 - absDistance,
    };
  };

  const handleCardPress = (index) => {
    setActiveIndex(index);
    Animated.timing(animatedIndex, {
      toValue: index,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = () => {
    if (activeIndex < CLINIC_CENTERS.length - 1) {
      handleCardPress(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      handleCardPress(activeIndex - 1);
    }
  };

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          handleNext();
        } else if (gestureState.dx > 50) {
          handlePrev();
        }
      },
    })
  ).current;

  const activeCenter = CLINIC_CENTERS[activeIndex];

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Clinic & Centers</Text>
        <Pressable style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </Pressable>
      </View>
      <View style={styles.divider} />

      {/* Coverflow Carousel */}
      <View style={styles.carouselContainer} {...panResponder.panHandlers}>
        <View style={styles.carousel}>
          {CLINIC_CENTERS.map((center, index) => (
            <Animated.View
              key={center.id}
              style={[styles.card, getCardStyle(index)]}
            >
              <Image source={{ uri: center.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.cardGradient}>
                <Text style={styles.cardTitle}>{center.title}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Active Card Content */}
      <View style={styles.activeContent}>
        <Text style={styles.activeTitle}>{activeCenter.title}</Text>
        <Text style={styles.activeDescription} numberOfLines={3}>
          {activeCenter.description}
        </Text>
        <Pressable style={styles.seeMoreButton}>
          <Text style={styles.seeMoreText}>See More →</Text>
        </Pressable>
      </View>

      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {CLINIC_CENTERS.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => handleCardPress(index)}
            style={[
              styles.dot,
              index === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Arrow Controls */}
      <View style={styles.arrowControls}>
        <Pressable onPress={handlePrev} style={styles.arrowButton}>
          <Text style={styles.arrowText}>←</Text>
        </Pressable>
        <Pressable onPress={handleNext} style={styles.arrowButton}>
          <Text style={styles.arrowText}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1B1C1C',
    fontFamily: 'Georgia',
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A0404',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(27, 28, 28, 0.1)',
    marginBottom: 32,
  },
  carouselContainer: {
    height: 450,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  carousel: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  activeContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1C1C',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
  activeDescription: {
    fontSize: 15,
    color: '#5F5E5F',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  seeMoreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4A0404',
    borderRadius: 8,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(27, 28, 28, 0.2)',
  },
  dotActive: {
    backgroundColor: '#4A0404',
    width: 24,
  },
  arrowControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(27, 28, 28, 0.1)',
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1C1C',
  },
});
