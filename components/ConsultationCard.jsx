import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';

/**
 * ConsultationCard - Free consultation form widget for Homepage only
 * Glassmorphism card with sticky/fixed positioning
 * NOT related to Shop Hero Slider or any other page
 */
export default function ConsultationCard({ isPhone = false }) {
  const [fullName, setFullName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [medicalConcern, setMedicalConcern] = useState('');
  const [errors, setErrors] = useState({});

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

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('📋 Consultation Form Submitted:', {
        fullName,
        whatsappNumber,
        medicalConcern,
        timestamp: new Date().toISOString(),
      });
      
      // TODO: Connect to backend/WhatsApp API
      alert('Form submitted! Check console for details.');
      
      // Reset form
      setFullName('');
      setWhatsappNumber('');
      setMedicalConcern('');
      setErrors({});
    }
  };

  const cardContent = (
    <View style={styles.cardInner}>
      {/* Heading */}
      <Text style={[styles.heading, isPhone && styles.headingPhone]}>
        Get Free Consultation
      </Text>

      {/* Subheading */}
      <Text style={[styles.subheading, isPhone && styles.subheadingPhone]}>
        Our care team replies within minutes
      </Text>

      {/* Full Name Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            isPhone && styles.inputPhone,
            errors.fullName && styles.inputError,
          ]}
          placeholder="Full Name"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (errors.fullName) {
              setErrors({ ...errors, fullName: null });
            }
          }}
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
          placeholder="WhatsApp Number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={whatsappNumber}
          onChangeText={(text) => {
            setWhatsappNumber(text);
            if (errors.whatsappNumber) {
              setErrors({ ...errors, whatsappNumber: null });
            }
          }}
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
          placeholder="Describe your medical concern..."
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
        />
        {errors.medicalConcern && (
          <Text style={styles.errorText}>{errors.medicalConcern}</Text>
        )}
      </View>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          isPhone && styles.submitButtonPhone,
          pressed && styles.submitButtonPressed,
        ]}
        onPress={handleSubmit}
      >
        <Text style={[styles.submitButtonText, isPhone && styles.submitButtonTextPhone]}>
          Get Free Consultation →
        </Text>
      </Pressable>

      {/* Trust Line */}
      <Text style={[styles.trustLine, isPhone && styles.trustLinePhone]}>
        🔒 Your information stays confidential
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        isPhone && styles.containerPhone,
      ]}
    >
      {Platform.OS === 'web' ? (
        // Web: CSS backdrop-filter applied as inline style for React Native Web compatibility
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
      ) : (
        // Native: BlurView
        <BlurView intensity={80} tint="light" style={styles.cardNative}>
          {cardContent}
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: Platform.OS === 'web' ? '50%' : '50%',
    left: Platform.OS === 'web' ? '50%' : '50%',
    width: 380,
    maxWidth: '90%',
    zIndex: 999,
    ...(Platform.OS === 'web' && {
      transform: 'translate(-50%, -50%)',
    }),
    ...(Platform.OS !== 'web' && {
      transform: [{ translateX: -190 }, { translateY: -200 }],
    }),
  },
  containerPhone: {
    width: '92%',
    top: Platform.OS === 'web' ? '50%' : '50%',
    ...(Platform.OS === 'web' && {
      transform: 'translate(-50%, -50%)',
    }),
    ...(Platform.OS !== 'web' && {
      transform: [{ translateX: '46%' }, { translateY: -150 }],
    }),
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
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 6,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#1b5e20',
    transform: [{ scale: 0.98 }],
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
});
