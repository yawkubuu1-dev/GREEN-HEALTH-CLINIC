import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Share,
  Alert,
  ImageBackground,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const palette = {
  background: '#FAF9F9',
  surface: '#FFFFFF',
  charcoal: '#1B1C1C',
  secondary: '#5F5E5F',
  oxblood: '#4A0404',
  oxbloodSoft: '#D26A5F',
  vault: '#202222',
};

const darkPalette = {
  background: '#121212',
  surface: '#1E1E1E',
  charcoal: '#E8EAED',
  secondary: '#B0B0B0',
  oxblood: '#D26A5F',
  oxbloodSoft: '#FF8A80',
  vault: '#000000',
};

export default function ProductDetail({ product, visible, onClose, onAddToCart, onSetCartQuantity, cartItems = [], isUserDarkMode }) {
  const { width, height } = useWindowDimensions();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('M');
  const [showQuantityControls, setShowQuantityControls] = useState(false);
  const scrollViewRef = useRef(null);

  const allSizeOptions = [
    { label: 'S', measurement: '36-38', stockKey: 'stock_s' },
    { label: 'M', measurement: '38-40', stockKey: 'stock_m' },
    { label: 'L', measurement: '40-42', stockKey: 'stock_l' },
    { label: 'XL', measurement: '42-44', stockKey: 'stock_xl' },
    { label: 'XXL', measurement: '44-46', stockKey: 'stock_xxl' }
  ];

  // Show only sizes with stock > 0
  const sizeOptions = allSizeOptions
    .map(option => {
      const stock = product?.[option.stockKey] ?? 0;
      return {
        ...option,
        stock: stock
      };
    })
    .filter(option => option.stock > 0);

  // Set default selected size to first available size, or M if all sizes are available
  const defaultSelectedSize = sizeOptions.length > 0 ? sizeOptions[0].label : 'M';

  // Reset state when product changes or modal opens/closes
  useEffect(() => {
    console.log('useEffect triggered', { visible, productId: product?.id });
    if (visible && product) {
      // Check if this product (with selected weight) is already in cart
      const cartItem = cartItems.find(
        (item) => item.id === product.id && item.selectedWeight === (product.hasSizes ? defaultSelectedSize : 'unit')
      );

      console.log('Cart item check', { cartItem: !!cartItem, productName: product.name });

      if (cartItem) {
        // Product is in cart - show quantity controls with cart quantity
        setShowQuantityControls(true);
        setQuantity(cartItem.quantity);
      } else {
        // Product not in cart - show "Add to Cart" button
        setShowQuantityControls(false);
        setQuantity(1);
      }

      // Reset other states
      setSelectedImageIndex(0);
      setSelectedWeight(defaultSelectedSize);
    }
  }, [visible, product?.id, defaultSelectedSize]); // Watch visible, product ID, and default selected size

  // Update quantity when weight/size changes
  useEffect(() => {
    if (visible && product) {
      const cartItem = cartItems.find(
        (item) => item.id === product.id && item.selectedWeight === (product.hasSizes ? selectedWeight : 'unit')
      );
      
      if (cartItem) {
        // This weight is in cart - show controls with cart quantity
        setShowQuantityControls(true);
        setQuantity(cartItem.quantity);
      } else if (showQuantityControls) {
        // This weight is NOT in cart but controls are showing - reset to 1
        setQuantity(1);
      }
    }
  }, [selectedWeight]); // Watch for weight changes

  // Calculate current price based on size selection - MUST be before early return
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (!product.hasSizes) return product.price || 0;
    if (selectedWeight === 'S') return product.price_s || 0;
    if (selectedWeight === 'M') return product.price_m || 0;
    if (selectedWeight === 'L') return product.price_l || 0;
    if (selectedWeight === 'XL') return product.price_xl || 0;
    if (selectedWeight === 'XXL') return product.price_xxl || 0;
    return product.price || 0;
  }, [selectedWeight, product]);

  const totalPrice = currentPrice * quantity;

  // Get product images - MUST be after hooks
  const images = useMemo(() => {
    if (!product) return ['https://via.placeholder.com/600x600?text=No+Image'];
    
    console.log('🖼️ Product Images Debug:', {
      productName: product.name,
      hasProductImages: !!product.product_images,
      productImagesLength: product.product_images?.length || 0,
      productImagesArray: product.product_images,
      singleImage: product.image,
      finalImagesCount: product.product_images?.length > 0 
        ? product.product_images.length
        : (product.image ? 1 : 0)
    });
    
    const finalImages = product.product_images?.length > 0 
      ? product.product_images
          .map(img => (img.url || img.image_url)?.trim()) // Use url column (fallback to image_url)
          .filter(url => url && !url.includes('unsplash.com')) // ✅ Remove mock Unsplash images
      : product.image 
      ? [product.image] 
      : ['https://via.placeholder.com/600x600?text=No+Image'];
    
    console.log('🎨 Final images array:', finalImages);
    console.log('📊 Total images to display:', finalImages.length);

    return finalImages;
  }, [product]);

  // Early return AFTER all hooks
  if (!product) return null;

  const handleImageScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const imageWidth = width;
    const index = Math.round(scrollPosition / imageWidth);
    setSelectedImageIndex(index);
  };

  const scrollToImage = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setSelectedImageIndex(index);
  };

  const handleShare = async () => {
    try {
      const shareUrl = images[selectedImageIndex] || images[0];
      await Share.share({
        message: `Check out ${product.name}!\n\nPrice: GHC ${currentPrice.toFixed(2)}\n\n${product.description || ''}\n\nImage: ${shareUrl}`,
        title: product.name,
      });
    } catch (error) {
      console.warn('Error sharing product:', error);
    }
  };

  const incrementQuantity = () => {
    if (product.stock_quantity && quantity >= product.stock_quantity) {
      Alert.alert('Stock Limit', `Only ${product.stock_quantity} items available`);
      return;
    }
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCartClick = () => {
    // Check stock for the selected size
    const stockKey = `stock_${selectedWeight.toLowerCase()}`;
    const stockForSize = product?.[stockKey] || 0;

    console.log('Add to Cart clicked', { product: product?.name, size: selectedWeight, stock: stockForSize });
    if (stockForSize === 0) {
      Alert.alert('Out of Stock', `Size ${selectedWeight} is currently unavailable`);
      return;
    }
    setShowQuantityControls(true);
    setQuantity(1); // Start with quantity 1
    console.log('Quantity controls shown');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isUserDarkMode ? darkPalette.background : palette.background }]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, {
            backgroundColor: isUserDarkMode ? darkPalette.surface : palette.surface,
            borderBottomColor: isUserDarkMode ? '#333' : '#E5E5E5'
          }]}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="arrow-left" size={24} color={isUserDarkMode ? darkPalette.charcoal : palette.charcoal} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Product Details</Text>
            <Pressable onPress={handleShare} style={styles.shareButton}>
              <FontAwesome name="share-alt" size={20} color={isUserDarkMode ? darkPalette.charcoal : palette.charcoal} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Image Gallery with Blurred Background */}
            <View style={styles.imageGalleryContainer}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleImageScroll}
                scrollEventThrottle={16}
                style={styles.imageScrollView}
              >
                {images.map((imageUrl, index) => (
                  <View key={index} style={[styles.imageContainer, { width }]}>
                    {/* Blurred Background Image */}
                    <ImageBackground
                      source={{ uri: imageUrl }}
                      style={styles.blurredBackground}
                      blurRadius={50}
                      resizeMode="cover"
                    >
                      {/* Overlay to darken/lighten the blur */}
                      <View style={styles.blurOverlay} />
                    </ImageBackground>
                    
                    {/* Sharp Product Image on Top */}
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>

              {/* Thumbnail Gallery - Directly under main image */}
              {images.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailContainer}
                  contentContainerStyle={styles.thumbnailContent}
                >
                  {images.map((imageUrl, index) => (
                    <Pressable
                      key={index}
                      onPress={() => scrollToImage(index)}
                      style={[
                        styles.thumbnail,
                        selectedImageIndex === index && styles.thumbnailActive,
                      ]}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              {/* Image Dots Indicator - At the bottom */}
              {images.length > 1 && (
                <View style={styles.dotsContainer}>
                  {images.map((_, index) => (
                    <Pressable
                      key={index}
                      onPress={() => scrollToImage(index)}
                      style={[
                        styles.dot,
                        selectedImageIndex === index && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Product Info */}
            <View style={[styles.infoContainer, { backgroundColor: isUserDarkMode ? darkPalette.background : palette.background }]}>
              {product.tag && (
                <View style={[styles.tagContainer, { backgroundColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood }]}>
                  <Text style={styles.tagText}>{product.tag}</Text>
                </View>
              )}

              <Text style={[styles.productName, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>{product.name}</Text>

              <Text style={[styles.price, { color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood }]}>
                GHC {typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
              </Text>

              {product.stock_quantity !== undefined && product.stock_quantity !== null && (
                <Text style={[styles.stock, { color: isUserDarkMode ? darkPalette.secondary : palette.secondary }]}>
                  {product.stock_quantity > 0 
                    ? `${product.stock_quantity} in stock`
                    : 'Out of stock'}
                </Text>
              )}

              {product.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={[styles.sectionTitle, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Description</Text>
                  <Text style={[styles.description, { color: isUserDarkMode ? darkPalette.secondary : palette.secondary }]}>{product.description}</Text>
                </View>
              )}

              {product.categoryLabel && (
                <View style={styles.categoryContainer}>
                  <Text style={[styles.sectionTitle, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Category</Text>
                  <Text style={[styles.categoryText, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>{product.categoryLabel}</Text>
                </View>
              )}

              {/* Size Selection (if applicable) */}
              {product.hasWeights && (
                <View style={styles.weightSelectionContainer}>
                  <View style={styles.sizeHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Select Size</Text>
                    <Pressable style={[styles.sizeGuideButton, isUserDarkMode && styles.sizeGuideButtonDark]} onPress={() => Alert.alert('Size Guide', 'S: 36-38\nM: 38-40\nL: 40-42\nXL: 42-44\nXXL: 44-46')}>
                      <FontAwesome name="ruler" size={16} color={isUserDarkMode ? darkPalette.oxblood : palette.oxblood} />
                      <Text style={[styles.sizeGuideText, { color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood }]}>Size Guide</Text>
                    </Pressable>
                  </View>
                  <View style={styles.weightOptionsRow}>
                    {sizeOptions.map((option) => {
                      const active = option.label === selectedWeight;
                      const isOutOfStock = option.stock === 0;
                      return (
                        <Pressable
                          key={option.label}
                          onPress={() => !isOutOfStock && setSelectedWeight(option.label)}
                          style={[
                            styles.weightOption,
                            active && styles.weightOptionActive,
                            isOutOfStock && styles.weightOptionOutOfStock,
                            !active && !isOutOfStock && isUserDarkMode && {
                              borderColor: '#444',
                              backgroundColor: darkPalette.surface
                            }
                          ]}
                          disabled={isOutOfStock}
                        >
                          <Text style={[
                            styles.weightOptionLabel,
                            active && styles.weightOptionTextActive,
                            isOutOfStock && styles.weightOptionTextOutOfStock,
                            !active && !isOutOfStock && isUserDarkMode && { color: darkPalette.secondary }
                          ]}>
                            {option.label}
                          </Text>
                          <Text style={[
                            styles.weightOptionMeasurement,
                            active && styles.weightOptionTextActive,
                            isOutOfStock && styles.weightOptionTextOutOfStock,
                            !active && !isOutOfStock && isUserDarkMode && { color: darkPalette.secondary }
                          ]}>
                            {option.measurement}
                          </Text>
                          {isOutOfStock && (
                            <Text style={styles.outOfStockText}>Out of Stock</Text>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={[styles.pricePerUnit, { color: isUserDarkMode ? darkPalette.secondary : palette.secondary }]}>
                    Price for size {selectedWeight}
                  </Text>
                </View>
              )}

              {/* Quantity Selection */}
              <View style={styles.quantityContainer}>
                <Text style={[styles.sectionTitle, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Quantity</Text>
                
                {!showQuantityControls ? (
                  /* Add to Cart Button - Shows initially */
                  <Pressable
                    style={[
                      styles.initialAddToCartButton,
                      (() => {
                        const stockKey = `stock_${selectedWeight.toLowerCase()}`;
                        const stockForSize = product?.[stockKey] || 0;
                        return stockForSize === 0 && styles.initialAddToCartButtonDisabled;
                      })(),
                      { backgroundColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood }
                    ]}
                    onPress={handleAddToCartClick}
                    disabled={() => {
                      const stockKey = `stock_${selectedWeight.toLowerCase()}`;
                      return (product?.[stockKey] || 0) === 0;
                    }}
                  >
                    <FontAwesome name="shopping-cart" size={18} color="#FFF" />
                    <Text style={styles.initialAddToCartText}>
                      {(() => {
                        const stockKey = `stock_${selectedWeight.toLowerCase()}`;
                        const stockForSize = product?.[stockKey] || 0;
                        return stockForSize === 0 ? 'Out of Stock' : 'Add to Cart';
                      })()}
                    </Text>
                  </Pressable>
                ) : (
                  /* Quantity Controls - Shows after clicking Add to Cart */
                  <View style={styles.quantityControls}>
                    <Pressable 
                      onPress={decrementQuantity} 
                      style={[
                        styles.quantityButton, 
                        quantity <= 1 && styles.quantityButtonDisabled,
                        isUserDarkMode && {
                          backgroundColor: darkPalette.surface,
                          borderColor: '#444'
                        }
                      ]}
                      disabled={quantity <= 1}
                    >
                      <FontAwesome name="minus" size={16} color={quantity <= 1 ? '#CCC' : (isUserDarkMode ? darkPalette.charcoal : palette.charcoal)} />
                    </Pressable>
                    <Text style={[styles.quantityText, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>{quantity}</Text>
                    <Pressable 
                      onPress={incrementQuantity} 
                      style={[
                        styles.quantityButton,
                        isUserDarkMode && {
                          backgroundColor: darkPalette.surface,
                          borderColor: '#444'
                        }
                      ]}
                    >
                      <FontAwesome name="plus" size={16} color={isUserDarkMode ? darkPalette.charcoal : palette.charcoal} />
                    </Pressable>
                  </View>
                )}
                
                {product.stock_quantity !== undefined && product.stock_quantity !== null && (
                  <Text style={[styles.stockInfo, { color: isUserDarkMode ? darkPalette.secondary : palette.secondary }]}>
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} available`
                      : 'Out of stock'}
                  </Text>
                )}
              </View>

              {/* Total Price Display */}
              <View style={[styles.totalPriceContainer, {
                backgroundColor: isUserDarkMode ? darkPalette.surface : '#F5F5F5'
              }]}>
                <Text style={[styles.totalPriceLabel, { color: isUserDarkMode ? darkPalette.charcoal : palette.charcoal }]}>Total Price:</Text>
                <Text style={[styles.totalPrice, { color: isUserDarkMode ? darkPalette.oxblood : palette.oxblood }]}>GHC {totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Cart Info Bar */}
          {cartItems.length > 0 && (
            <View style={[styles.cartInfoBar, {
              backgroundColor: isUserDarkMode ? darkPalette.vault : '#1B1C1C',
            }]}>
              <View>
                <Text style={styles.cartInfoLabel}>CART</Text>
                <Text style={styles.cartInfoCount}>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</Text>
              </View>
              <Pressable style={styles.viewCartBtn} onPress={() => onClose()}>
                <Text style={styles.viewCartText}>VIEW CART</Text>
              </Pressable>
            </View>
          )}

          {/* Add to Cart Button */}
          <View style={[styles.footer, {
            backgroundColor: isUserDarkMode ? darkPalette.surface : palette.surface,
            borderTopColor: isUserDarkMode ? '#333' : '#E5E5E5'
          }]}>
            <Pressable
              style={[
                styles.addToCartButton,
                (() => {
                  const stockKey = `stock_${selectedWeight.toLowerCase()}`;
                  const stockForSize = product?.[stockKey] || 0;
                  return (!showQuantityControls || stockForSize === 0) && styles.addToCartButtonDisabled;
                })(),
                { backgroundColor: isUserDarkMode ? darkPalette.oxblood : palette.oxblood }
              ]}
              onPress={() => {
                const stockKey = `stock_${selectedWeight.toLowerCase()}`;
                const stockForSize = product?.[stockKey] || 0;
                console.log('Footer Add to Cart pressed', { showQuantityControls, size: selectedWeight, stock: stockForSize });
                if (!showQuantityControls) {
                  Alert.alert('Select Quantity', 'Please click "Add to Cart" button first to select quantity');
                  return;
                }
                if (stockForSize === 0) {
                  Alert.alert('Out of Stock', `Size ${selectedWeight} is currently unavailable`);
                  return;
                }

                // Check if item is already in cart (for display message only)
                const existingCartItem = cartItems.find(
                  (item) => item.id === product.id && item.selectedWeight === (product.hasSizes ? selectedWeight : 'unit')
                );

                // Ensure product has image field (might be in product_images array)
                const productWithImage = {
                  ...product,
                  image: product.image || product.product_images?.[0]?.url || product.product_images?.[0]?.image_url || 'https://via.placeholder.com/600x600?text=No+Image'
                };

                console.log('Calling onSetCartQuantity', {
                  product: product.name,
                  selectedWeight,
                  currentPrice,
                  quantity
                });

                // ALWAYS use setCartQuantity - SET the quantity to what's displayed
                // Never add to existing - always replace with the displayed quantity
                onSetCartQuantity?.(productWithImage, product.hasWeights ? selectedWeight : 'unit', currentPrice, quantity);

                // Show success feedback
                Alert.alert(
                  existingCartItem ? 'Cart Updated' : 'Added to Cart',
                  existingCartItem
                    ? `${product.name} quantity updated to ${quantity}`
                    : `${quantity} × ${product.name} added to your cart`,
                  [{ text: 'OK' }]
                );

                onClose(); // useEffect will reset state when modal closes
              }}
              disabled={() => {
                const stockKey = `stock_${selectedWeight.toLowerCase()}`;
                return !showQuantityControls || (product?.[stockKey] || 0) === 0;
              }}
            >
              <FontAwesome name="shopping-cart" size={20} color="#FFF" />
              <Text style={styles.addToCartText}>
                {(() => {
                  const stockKey = `stock_${selectedWeight.toLowerCase()}`;
                  const stockForSize = product?.[stockKey] || 0;
                  if (stockForSize === 0) return 'Out of Stock';
                  if (!showQuantityControls) return 'Select Quantity First';
                  const existingCartItem = cartItems.find(
                    (item) => item.id === product.id && item.selectedWeight === (product.hasSizes ? selectedWeight : 'unit')
                  );
                  return existingCartItem
                    ? `Update Cart (${quantity}) • GHC ${totalPrice.toFixed(2)}`
                    : `Add ${quantity} to Cart • GHC ${totalPrice.toFixed(2)}`;
                })()}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.charcoal,
  },
  content: {
    flex: 1,
  },
  imageGalleryContainer: {
    backgroundColor: '#000',
  },
  imageScrollView: {
    height: 400,
  },
  imageContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  blurredBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Light overlay to brighten the blur
  },
  productImage: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  imageLoader: {
    position: 'absolute',
    zIndex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: palette.oxblood,
    width: 24,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  thumbnailContent: {
    gap: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: palette.oxblood,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    backgroundColor: palette.oxblood,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 12,
  },
  tagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.charcoal,
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.oxblood,
    marginBottom: 8,
  },
  stock: {
    fontSize: 14,
    color: palette.secondary,
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.charcoal,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.secondary,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 15,
    color: palette.charcoal,
  },
  weightSelectionContainer: {
    marginBottom: 20,
  },
  sizeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sizeGuideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 20,
  },
  sizeGuideButtonDark: {
    borderColor: '#444',
  },
  sizeGuideText: {
    fontSize: 13,
    fontWeight: '600',
  },
  weightOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  weightOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    minHeight: 70,
  },
  weightOptionActive: {
    borderColor: palette.oxblood,
    backgroundColor: palette.oxblood,
    shadowColor: palette.oxblood,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  weightOptionOutOfStock: {
    opacity: 0.5,
    backgroundColor: '#F0F0F0',
    borderColor: '#D0D0D0',
  },
  weightOptionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.charcoal,
  },
  weightOptionTextOutOfStock: {
    color: '#999999',
  },
  weightOptionMeasurement: {
    fontSize: 11,
    fontWeight: '500',
    color: palette.secondary,
    marginTop: 4,
  },
  outOfStockText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FF0000',
    marginTop: 2,
  },
  weightOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.charcoal,
  },
  weightOptionTextActive: {
    color: '#FFF',
  },
  pricePerUnit: {
    fontSize: 12,
    color: palette.secondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  initialAddToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.oxblood,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  initialAddToCartButtonDisabled: {
    backgroundColor: '#CCC',
  },
  initialAddToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.3,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.charcoal,
    minWidth: 40,
    textAlign: 'center',
  },
  stockInfo: {
    fontSize: 12,
    color: palette.secondary,
    marginTop: 8,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.charcoal,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.oxblood,
  },
  cartInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cartInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.7,
  },
  cartInfoCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  viewCartBtn: {
    backgroundColor: palette.oxblood,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  footer: {
    padding: 16,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.oxblood,
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
