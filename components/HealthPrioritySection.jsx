import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

/**
 * HealthPrioritySection - Text content section for Homepage
 * Positioned below HomeHero with clinic messaging and mission statement
 */
export default function HealthPrioritySection() {
  const { width } = useWindowDimensions();
  const isPhone = width <= 480;

  return (
    <View style={[styles.container, isPhone && styles.containerPhone]}>
      <View style={[styles.content, isPhone && styles.contentPhone]}>
        {/* Main Heading */}
        <Text style={[styles.heading, isPhone && styles.headingPhone]}>
          YOUR HEALTH. OUR PRIORITY.
        </Text>

        {/* Body Line */}
        <Text style={[styles.bodyLine, isPhone && styles.bodyLinePhone]}>
          We care about health and we don't sugarcoat.
        </Text>

        {/* Tagline */}
        <Text style={[styles.tagline, isPhone && styles.taglinePhone]}>
          Premium Service Healthcare.
        </Text>

        {/* Main Paragraph */}
        <Text style={[styles.paragraph, isPhone && styles.paragraphPhone]}>
          At K.E Green Health Clinic, we focus on finding the root cause of your health concerns and delivering personalized, evidence-based care that works.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  containerPhone: {
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  content: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  contentPhone: {
    maxWidth: '100%',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B5E20', // Dark green
    marginBottom: 8,
    textAlign: 'left',
  },
  headingPhone: {
    fontSize: 28,
  },
  bodyLine: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
    marginBottom: 6,
    textAlign: 'left',
  },
  bodyLinePhone: {
    fontSize: 16,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#8BC34A', // Light green/lime
    marginBottom: 20,
    textAlign: 'left',
  },
  taglinePhone: {
    fontSize: 16,
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
    lineHeight: 28,
    textAlign: 'left',
  },
  paragraphPhone: {
    fontSize: 16,
    lineHeight: 24,
  },
});