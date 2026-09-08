import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  useWindowDimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { consultationWidgetService, consultationSubmissionService } from '../services/supabaseService';

/**
 * ConsultationCard - Free consultation form widget for Homepage only
 * Glassmorphism card with sticky/fixed positioning
 * NOT related to Shop Hero Slider or any other page
 * On mobile: modal with open/close animation
 * On desktop/tablet: always visible, sticky
 * Wired to Supabase for both content and form submissions
 */
export default function ConsultationCard({ isPhone = false, visible = true, onClose, productId, useSticky = false, stickyTop = 76 }) {
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [medicalConcern, setMedicalConcern] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isMobile = windowWidth <= 480;
  
  // Animation values for modal
  const scaleAnim = useRef(new Animated.Value(isMobile ? 0.9 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(isMobile ? 0 : 1)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Load settings from Supabase on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('🔄 Loading consultation widget settings from Supabase...');
        const data = await consultationWidgetService.getSettings();
        setSettings(data);
        console.log('✅ Loaded consultation widget settings:', data);
      } catch (error) {
        console.error('❌ Failed to load consultation widget settings:', error);
        // Use default settings if Supabase fails
        setSettings({
          heading: 'Get Free Consultation',
          subheading: 'Our care team replies within minutes',
          name_placeholder: 'Full Name',
          whatsapp_placeholder: 'WhatsApp Number',
          concern_placeholder: 'Describe your medical concern...',
          button_text: 'Get Free Consultation →',
          trust_line: 'Your information stays confidential'
        });
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  // Animate in/out on visibility change (mobile only)
  useEffect(() => {
    if (isMobile) {
      if (visible) {
        // Animate in
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      } else {
        // Animate out
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 250,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      }
    }
  }, [visible, isMobile]);

  // Don't render on mobile if not visible
  if (isMobile && !visible) {
    return null;
  }

  // Show loading state while fetching settings
  if (loadingSettings) {
    return (
      <View style={[
        isMobile ? styles.container : styles.containerDesktop,
        { justifyContent: 'center', alignItems: 'center' }
      ]}>
        <ActivityIndicator size="small" color="#2e7d32" />
      </View>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(whatsappNumber)) {
      newErrors.whatsappNumber = 'Please enter a valid phone number';
    }
    
    if (!medicalConcern.trim()) {
      newErrors.medicalConcern = 'Please describe your medical concern';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      console.log('📋 Submitting consultation form to Supabase...');
      const submission = await consultationSubmissionService.submit({
        fullName: fullName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        medicalConcern: medicalConcern.trim(),
      });
      
      console.log('✅ Consultation form submitted successfully:', submission);
      
      // Clear form and show success
      setFullName('');
      setWhatsappNumber('');
      setMedicalConcern('');
      setShowSuccess(true);
      
      // Hide success message and close modal after delay
      setTimeout(() => {
        setShowSuccess(false);
        if (isMobile && onClose) {
          setTimeout(onClose, 500); // Close modal after success message fades
        }
      }, 2500);
      
    } catch (error) {
      console.error('❌ Failed to submit consultation form:', error);
      setErrors({
        submit: 'Failed to submit form. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cardContent = (
    <View style={styles.cardInner}>
      {/* Close button (mobile only) */}
      {isMobile && onClose && (
        <Pressable 
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={8}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </Pressable>
      )}
      
      {showSuccess ? (
        // Success state
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={[styles.heading, isMobile && styles.headingMobile]}>
            Thanks! We'll be in touch shortly.
          </Text>
          <Text style={[styles.subheading, isMobile && styles.subheadingMobile]}>
            Our care team will contact you via WhatsApp soon.
          </Text>
        </View>
      ) : (
        // Form state
        <>
          {/* Heading */}
          <Text style={[styles.heading, isMobile && styles.headingMobile]}>
            {settings?.heading || 'Get Free Consultation'}
          </Text>

          {/* Subheading */}
          <Text style={[styles.subheading, isMobile && styles.subheadingMobile]}>
            {settings?.subheading || 'Our care team replies within minutes'}
          </Text>

          {/* Submit Error */}
          {errors.submit && (
            <Text style={styles.submitError}>{errors.submit}</Text>
          )}

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                isPhone && styles.inputPhone,
                errors.fullName && styles.inputError,
              ]}
              placeholder={settings?.name_placeholder || 'Full Name'}
              placeholderTextColor="#999"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) {
                  setErrors({ ...errors, fullName: null });
                }
              }}
              editable={!submitting}
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          {/* WhatsApp Number Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                isPhone && styles.inputPhone,
                errors.whatsappNumber && styles.inputError,
              ]}
              placeholder={settings?.whatsapp_placeholder || 'WhatsApp Number'}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={whatsappNumber}
              onChangeText={(text) => {
                setWhatsappNumber(text);
                if (errors.whatsappNumber) {
                  setErrors({ ...errors, whatsappNumber: null });
                }
              }}
              editable={!submitting}
            />
            {errors.whatsappNumber && (
              <Text style={styles.errorText}>{errors.whatsappNumber}</Text>
            )}
          </View>

          {/* Medical Concern Textarea */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textarea,
                isPhone && styles.textareaPhone,
                errors.medicalConcern && styles.inputError,
              ]}
              placeholder={settings?.concern_placeholder || 'Describe your medical concern...'}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={medicalConcern}
              onChangeText={(text) => {
                setMedicalConcern(text);
                if (errors.medicalConcern) {
                  setErrors({ ...errors, medicalConcern: null });
                }
              }}
              editable={!submitting}
            />
            {errors.medicalConcern && (
              <Text style={styles.errorText}>{errors.medicalConcern}</Text>
            )}
          </View>

          {/* Submit Button with Glassmorphism */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              isPhone && styles.submitButtonPhone,
              (pressed || submitting) && styles.submitButtonPressed,
              submitting && styles.submitButtonDisabled,
              // Apply backdrop-filter as inline style for RN Web compatibility
              Platform.OS === 'web' && {
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={[styles.submitButtonText, isPhone && styles.submitButtonTextPhone]}>
                {settings?.button_text || 'Get Free Consultation →'}
              </Text>
            )}
          </Pressable>

          {/* Trust Line */}
          <Text style={[styles.trustLine, isPhone && styles.trustLinePhone]}>
            🔒 {settings?.trust_line || 'Your information stays confidential'}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isMobile && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              pointerEvents: visible ? 'auto' : 'none',
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
      )}
      
      {/* Card */}
      {Platform.OS === 'web' ? (
        <Animated.View
          style={[
            isMobile ? styles.container : (useSticky ? styles.containerDesktopSticky : styles.containerDesktop),
            useSticky && { top: stickyTop }, // Apply custom sticky top if provided
            {
              opacity: isMobile ? opacityAnim : 1, // Only animate opacity on mobile
              pointerEvents: visible ? 'auto' : 'none', // Always prevent blocking when hidden
            },
          ]}
        >
          {isMobile ? (
            <Animated.View
              style={[
                styles.cardContainerWeb,
                isMobile && styles.cardContainerWebMobile,
                isMobile && {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View 
                style={[
                  styles.cardWeb,
                  isMobile && styles.cardWebMobile,
                  // Inline style override for backdrop-filter (RN Web compatibility)
                  Platform.OS === 'web' && {
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                  },
                ]}
              >
                {cardContent}
              </View>
            </Animated.View>
          ) : (
            // Desktop: Direct card without extra wrapper
            <View 
              style={[
                styles.cardWeb,
                // Inline style override for backdrop-filter (RN Web compatibility)
                Platform.OS === 'web' && {
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                },
              ]}
            >
              {cardContent}
            </View>
          )}
        </Animated.View>
      ) : (
        // React Native: Use full-screen flexbox container for centering
        <Animated.View
          style={[
            styles.containerNative,
            {
              width: windowWidth,
              height: windowHeight - 60, // Subtract header height
              opacity: isMobile ? opacityAnim : 1, // Only animate opacity on mobile
              pointerEvents: visible ? 'auto' : 'none', // Always prevent blocking when hidden
            },
          ]}
        >
          <Animated.View
            style={[
              styles.cardContainerNative,
              isMobile && styles.cardContainerNativeMobile,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <BlurView 
              intensity={80} 
              tint="light" 
              style={[
                styles.cardNative,
                isMobile && styles.cardNativeMobile,
              ]}
            >
              {cardContent}
            </BlurView>
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed',
    top: 60, // Header height offset
    left: 0,
    width: '100vw',
    height: 'calc(100dvh - 60px)', // Subtract header height
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerDesktop: {
    // Desktop: Centered card position
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    width: 380,
    zIndex: 1000, // Lower z-index for desktop
  },
  containerDesktopSticky: {
    // Desktop: Sticky positioning within wrapper
    position: 'sticky',
    top: 76, // Default sticky top, can be overridden via prop
    alignSelf: 'center',
    width: 380,
    maxWidth: '100%',
    pointerEvents: 'auto',
  },
  // React Native: Full-screen flexbox centering
  containerNative: {
    position: 'absolute',
    top: 60, // Header height offset
    left: 0,
    width: '100%',
    height: '100%', // Will be dynamically set to windowHeight - 60
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  cardContainerWeb: {
    width: '85%',
    maxWidth: 380,
  },
  cardContainerWebMobile: {
    width: '90%',
    maxWidth: 320,
  },
  cardContainerNative: {
    width: '85%',
    maxWidth: 380,
  },
  cardContainerNativeMobile: {
    width: '90%', 
    maxWidth: 320,
  },
  cardWeb: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 20,
    padding: 24,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    }),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardNative: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    // Shadow for native
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  cardInner: {
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
    textAlign: 'center',
  },
  headingPhone: {
    fontSize: 20,
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheadingPhone: {
    fontSize: 13,
    marginBottom: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  submitError: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 6,
  },
  inputContainer: {
    marginBottom: 14,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a2e',
    ...(Platform.OS === 'web' && {
      outlineColor: '#2e7d32',
    }),
  },
  inputPhone: {
    fontSize: 14,
    paddingVertical: 10,
  },
  textarea: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a2e',
    minHeight: 100,
    ...(Platform.OS === 'web' && {
      outlineColor: '#2e7d32',
    }),
  },
  textareaPhone: {
    fontSize: 14,
    minHeight: 80,
  },
  inputError: {
    borderColor: '#dc2626',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: 'rgba(46, 125, 50, 0.55)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    // Shadow for depth
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
    }),
    ...(Platform.OS !== 'web' && {
      shadowColor: '#2e7d32',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    }),
  },
  submitButtonPhone: {
    paddingVertical: 12,
  },
  submitButtonPressed: {
    backgroundColor: 'rgba(46, 125, 50, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(46, 125, 50, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  submitButtonTextPhone: {
    fontSize: 14,
  },
  trustLine: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  trustLinePhone: {
    fontSize: 11,
  },
  cardWebMobile: {
    padding: 12,
    paddingTop: 10,
    paddingBottom: 10,
    ...(Platform.OS === 'web' && {
      maxHeight: '70vh',
      overflowY: 'auto',
    }),
  },
  cardNativeMobile: {
    padding: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headingMobile: {
    fontSize: 16,
    marginBottom: 3,
  },
  subheadingMobile: {
    fontSize: 11,
    marginBottom: 8,
  },
  inputContainerMobile: {
    marginBottom: 6,
  },
  inputMobile: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 36,
  },
  textareaMobile: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 50,
    maxHeight: 50,
  },
  submitButtonMobile: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 2,
    marginBottom: 5,
  },
  submitButtonTextMobile: {
    fontSize: 12,
  },
  trustLineMobile: {
    fontSize: 9,
    marginTop: 0,
  },
  // Backdrop for mobile modal
  backdrop: {
    position: 'fixed',
    top: 60, // Start below header
    left: 0,
    width: '100vw',
    height: 'calc(100dvh - 60px)', // Subtract header height
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99998,
  },
  // Close button (mobile only)
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 28,
    lineHeight: 28,
    color: '#1565C0', // Blue color as requested
    fontWeight: '300',
  },
});