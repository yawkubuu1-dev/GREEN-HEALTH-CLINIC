import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

/**
 * HealthPrioritySection - Text content section for Homepage
 * Positioned below HomeHero with clinic messaging and mission statement
 * Uses table layout on desktop/tablet, stacked on mobile
 */
export default function HealthPrioritySection() {
  const { width } = useWindowDimensions();
  const isPhone = width <= 480;
  const isTablet = width > 480 && width <= 768;
  const isMobile = width <= 600; // Use 600px breakpoint for responsive table

  return (
    <View style={[styles.container, isPhone && styles.containerPhone]}>
      <View style={[styles.content, isPhone && styles.contentPhone]}>
        
        {isMobile ? (
          // Mobile: Stacked single column layout
          <>
            <Text style={[styles.heading, isPhone && styles.headingPhone]}>
              YOUR HEALTH. OUR PRIORITY.
            </Text>

            <Text style={[styles.tagline, isPhone && styles.taglinePhone]}>
              Premium Service Healthcare.
            </Text>

            <Text style={[styles.bodyLine, isPhone && styles.bodyLinePhone]}>
              We care about health and we don't sugarcoat.
            </Text>

            <Text style={[styles.paragraph, isPhone && styles.paragraphPhone]}>
              At K.E Green Health Clinic, we focus on finding the root cause of your health concerns and delivering personalized, evidence-based care that works.
            </Text>
          </>
        ) : (
          // Desktop/Tablet: Two-column table layout
          <View style={styles.tableContainer}>
            {/* Row 1 */}
            <View style={styles.tableRow}>
              <View style={styles.leftCell}>
                <Text style={styles.heading}>
                  YOUR HEALTH. OUR PRIORITY.
                </Text>
              </View>
              <View style={styles.rightCell}>
                <Text style={styles.bodyLine}>
                  We care about health and we don't sugarcoat.
                </Text>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.tableRow}>
              <View style={styles.leftCell}>
                <Text style={styles.tagline}>
                  Premium Service Healthcare.
                </Text>
              </View>
              <View style={styles.rightCell}>
                <Text style={styles.paragraph}>
                  At K.E Green Health Clinic, we focus on finding the root cause of your health concerns and delivering personalized, evidence-based care that works.
                </Text>
              </View>
            </View>
          </View>
        )}

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
  
  // Table layout styles (desktop/tablet)
  tableContainer: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leftCell: {
    flex: 0.4, // 40% width for left column
    paddingRight: 24, // Breathing room between columns
    justifyContent: 'flex-start',
  },
  rightCell: {
    flex: 0.6, // 60% width for right column
    paddingLeft: 24, // Breathing room between columns
    justifyContent: 'flex-start',
  },

  // Text styles (same as before, preserved exactly)
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1B5E20', // Dark green
    marginBottom: 0, // Remove bottom margin in table layout
    textAlign: 'left',
  },
  headingPhone: {
    fontSize: 28,
    marginBottom: 8, // Restore margin for mobile stacked layout
  },
  bodyLine: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
    marginBottom: 0, // Remove bottom margin in table layout
    textAlign: 'left',
  },
  bodyLinePhone: {
    fontSize: 16,
    marginBottom: 6, // Restore margin for mobile stacked layout
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#8BC34A', // Light green/lime
    marginBottom: 0, // Remove bottom margin in table layout
    textAlign: 'left',
  },
  taglinePhone: {
    fontSize: 16,
    marginBottom: 16, // Restore margin for mobile stacked layout
  },
  paragraph: {
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
    lineHeight: 28,
    marginBottom: 0, // Remove bottom margin in table layout
    textAlign: 'left',
  },
  paragraphPhone: {
    fontSize: 16,
    lineHeight: 24,
  },
});