import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Pressable, Platform, Animated } from 'react-native';
import { useFooter } from '../contexts/FooterContext';

/**
 * Footer component for K.E Green Health Clinic
 * Renders on Homepage, About, Blogs, and Contact pages only
 * Collapsible with smooth expand/collapse animation
 * Uses global shared state via FooterContext
 */
export default function Footer({ onNavigate }) {
  const { width } = useWindowDimensions();
  const isPhone = width <= 768;
  const isTablet = width > 768 && width <= 1024;

  // Use global footer state from context
  const { isFooterExpanded, toggleFooter } = useFooter();

  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);

  // Toggle collapse/expand using global function
  const toggleCollapse = () => {
    toggleFooter();
  };

  // Animate height when collapse state changes
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isFooterExpanded ? contentHeight : 0,
      duration: 300,
      useNativeDriver: false, // JS-based animation for height
    }).start();
  }, [isFooterExpanded, contentHeight]);

  // Measure content height
  const handleLayout = (event) => {
    const height = event.nativeEvent.layout.height;
    setContentHeight(height);
    if (isFooterExpanded) {
      animatedHeight.setValue(height);
    }
  };

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleExternalLink = (url) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    }
  };

  const handleEmail = () => {
    if (Platform.OS === 'web') {
      window.open('mailto:info@kegreenhealth.com', '_blank');
    }
  };

  const handlePhone = () => {
    if (Platform.OS === 'web') {
      window.open('tel:+233501234567', '_blank');
    }
  };

  return (
    <View style={styles.footer}>
      {/* Toggle Button Bar */}
      <Pressable
        onPress={toggleCollapse}
        style={styles.toggleBar}
        accessibilityLabel={!isFooterExpanded ? 'Expand footer' : 'Collapse footer'}
        accessibilityRole="button"
      >
        <Text style={[styles.toggleText, isPhone && styles.toggleTextPhone]}>
          {!isFooterExpanded ? '© 2026 K.E Green Health Clinic' : 'Show Less'}
        </Text>
        <Text style={[styles.toggleIcon, isPhone && styles.toggleIconPhone]}>
          {!isFooterExpanded ? '▼' : '▲'}
        </Text>
      </Pressable>

      {/* Collapsible Content */}
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            height: animatedHeight,
          },
        ]}
      >
        <View
          style={[
            styles.container,
            isPhone ? styles.containerPhone : isTablet ? styles.containerTablet : styles.containerDesktop,
          ]}
          onLayout={handleLayout}
        >
          {/* Column 1 - Quick Links */}
          <View style={[styles.column, styles.quickLinksColumn, isPhone && styles.columnPhone]}>
            <Text style={[styles.columnTitle, isPhone && styles.columnTitlePhone]}>
              Quick Links
            </Text>
            <View style={[styles.linksList, isPhone && styles.linksListPhone]}>
              {[
                { label: 'Home', page: 'home' },
                { label: 'Shop', page: 'shop' },
                { label: 'Our Services', page: 'services' },
                { label: 'About', page: 'about' },
                { label: 'Blogs', page: 'blogs' },
                { label: 'Contact', page: 'contact' }
              ].map((link, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleNavigation(link.page)}
                  style={({ pressed }) => [
                    styles.footerLink,
                    pressed && styles.footerLinkPressed
                  ]}
                >
                  <Text style={[styles.linkText, isPhone && styles.linkTextPhone]}>
                    {link.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Column 2 - Contact Info */}
          <View style={[styles.column, isPhone && styles.columnPhone, !isPhone && styles.contactInfoColumn, isPhone && styles.contactInfoColumnPhone]}>
            <Text style={[styles.columnTitle, isPhone && styles.columnTitlePhone]}>
              Contact Info
            </Text>
            <View style={[styles.contactInfo, isPhone && styles.contactInfoPhone]}>
              {/* Address */}
              <View style={styles.contactItem}>
                <Text style={[styles.contactIcon, isPhone && styles.contactIconPhone]}>📍</Text>
                <Text style={[styles.contactText, isPhone && styles.contactTextPhone]}>
                  123 Health Avenue, Suite 200, Medical District, Accra, Ghana 00233
                </Text>
              </View>
              
              {/* Phone */}
              <Pressable onPress={handlePhone} style={styles.contactItem}>
                <Text style={[styles.contactIcon, isPhone && styles.contactIconPhone]}>📞</Text>
                <Text style={[styles.contactText, styles.contactLink, isPhone && styles.contactTextPhone]}>
                  +233 50 123 4567
                </Text>
              </Pressable>
              
              {/* Email */}
              <Pressable onPress={handleEmail} style={styles.contactItem}>
                <Text style={[styles.contactIcon, isPhone && styles.contactIconPhone]}>✉️</Text>
                <Text style={[styles.contactText, styles.contactLink, isPhone && styles.contactTextPhone]}>
                  info@kegreenhealth.com
                </Text>
              </Pressable>
              
              {/* Hours */}
              <View style={styles.contactItem}>
                <Text style={[styles.contactIcon, isPhone && styles.contactIconPhone]}>🕐</Text>
                <View style={styles.hoursContainer}>
                  <Text style={[styles.contactText, isPhone && styles.contactTextPhone]}>
                    Mon–Fri: 8:00 AM–5:00 PM
                  </Text>
                  <Text style={[styles.contactText, isPhone && styles.contactTextPhone]}>
                    Sat: 9:00 AM–2:00 PM
                  </Text>
                  <Text style={[styles.contactText, isPhone && styles.contactTextPhone]}>
                    Sun: Closed
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Column 3 - Follow Us */}
          <View style={[styles.column, styles.followUsColumn, isPhone && styles.columnPhone]}>
            <Text style={[styles.columnTitle, isPhone && styles.columnTitlePhone]}>
              Follow Us
            </Text>
            <View style={[styles.socialLinks, isPhone && styles.socialLinksPhone]}>
              {[
                { name: 'Facebook', url: 'https://facebook.com/kegreenhealth' },
                { name: 'Instagram', url: 'https://instagram.com/kegreenhealth' },
                { name: 'Twitter', url: 'https://twitter.com/kegreenhealth' },
                { name: 'LinkedIn', url: 'https://linkedin.com/company/kegreenhealth' },
                { name: 'YouTube', url: 'https://youtube.com/kegreenhealth' },
                { name: 'WhatsApp', url: 'https://wa.me/233501234567' },
                { name: 'Telegram', url: 'https://t.me/kegreenhealth' }
              ].map((social, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleExternalLink(social.url)}
                  style={({ pressed }) => [
                    styles.socialLink,
                    pressed && styles.socialLinkPressed
                  ]}
                >
                  <Text style={[styles.socialText, isPhone && styles.socialTextPhone]}>
                    {social.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Bottom Bar - Only show when expanded */}
      {isFooterExpanded && (
        <View style={styles.bottomBar}>
          <Text style={[styles.copyrightText, isPhone && styles.copyrightTextPhone]}>
            © 2026 K.E Green Health Clinic. All rights reserved.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1B2E1B', // Dark green background
    borderTopWidth: 1,
    borderTopColor: '#2D5A2D',
  },
  toggleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#1B2E1B',
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
  },
  toggleText: {
    fontSize: 13,
    color: '#B0BEB0',
    fontWeight: '500',
  },
  toggleTextPhone: {
    fontSize: 11,
  },
  toggleIcon: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  toggleIconPhone: {
    fontSize: 14,
  },
  animatedContainer: {
    overflow: 'hidden',
  },
  container: {
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  containerDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  containerTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  containerPhone: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  column: {
    flex: 1,
    marginRight: 40,
    minWidth: 0,
  },
  quickLinksColumn: {
    flex: 1,
  },
  contactInfoColumn: {
    flex: 2,
  },
  followUsColumn: {
    flex: 1,
  },
  columnPhone: {
    marginRight: 0,
    marginBottom: 32,
    minWidth: '100%',
    maxWidth: '100%',
    flex: 'unset',
  },
  contactInfoColumnPhone: {
    maxWidth: '100%',
  },
  
  // Column Titles
  columnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  columnTitlePhone: {
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Quick Links
  linksList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  linksListPhone: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  footerLink: {
    paddingVertical: 4,
  },
  footerLinkPressed: {
    opacity: 0.7,
  },
  linkText: {
    fontSize: 14,
    color: '#E0E0E0',
    textDecorationLine: 'none',
  },
  linkTextPhone: {
    fontSize: 13,
    textAlign: 'center',
  },
  
  // Contact Info
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  contactInfoPhone: {
    flexDirection: 'column',
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  contactIcon: {
    fontSize: 16,
    width: 18,
    height: 18,
    flexShrink: 0,
    marginTop: 2,
  },
  contactIconPhone: {
    fontSize: 14,
    width: 16,
    height: 16,
  },
  contactText: {
    fontSize: 14,
    color: '#E0E0E0',
    flex: 1,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  addressText: {
    flexWrap: 'wrap',
  },
  addressTextPhone: {
    maxWidth: '100%',
  },
  contactTextPhone: {
    fontSize: 13,
    lineHeight: 16,
  },
  contactLink: {
    textDecorationLine: 'underline',
  },
  hoursContainer: {
    flex: 1,
  },
  
  // Social Links
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  socialLinksPhone: {
    justifyContent: 'center',
    gap: 16,
  },
  socialLink: {
    paddingVertical: 4,
  },
  socialLinkPressed: {
    opacity: 0.7,
  },
  socialText: {
    fontSize: 14,
    color: '#4CAF50', // Brand green for social links
    textDecorationLine: 'underline',
  },
  socialTextPhone: {
    fontSize: 13,
  },
  
  // Bottom Bar
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#2D5A2D',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#B0BEB0',
    textAlign: 'center',
  },
  copyrightTextPhone: {
    fontSize: 11,
  },
});