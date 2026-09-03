# App.js Migration to Service Layer

This document shows you exactly how to update your existing App.js code to use the new Supabase service layer.

## Step 1: Add Import at Top of App.js

**Find this line (around line 25):**
```javascript
import { supabase } from './lib/supabase';
```

**Add this import right after it:**
```javascript
import { supabase } from './lib/supabase';
import { 
  productService, 
  categoryService, 
  carouselService,
  orderService 
} from './services/supabaseService';
```

---

## Step 2: Update Products Fetching (Line ~2658)

### OLD CODE (Lines 2657-2716):
```javascript
// Fetch products and product_images separately to avoid column alias issues
let prodRes = await supabase.from('products').select('*, stock_s, stock_m, stock_l, stock_xl, stock_xxl');

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
```

### NEW CODE (Replace with):
```javascript
// Fetch products using service layer
console.log('📡 Fetching products from Supabase...');

let prodRes = { data: null, error: null };
let catRes = { data: null, error: null };

try {
  // Fetch products
  const productsData = await productService.getAll();
  prodRes.data = productsData;
  console.log('✅ Products fetched:', productsData.length);
  
  // Fetch categories
  const categoriesData = await categoryService.getAll();
  catRes.data = categoriesData;
  console.log('📂 Categories fetched:', categoriesData.length);
  
} catch (error) {
  console.error('❌ Error fetching data:', error);
  prodRes.error = error;
  catRes.error = error;
}
```

---

## Step 3: Update Product Insert (Line ~4176)

### OLD CODE:
```javascript
const { error } = await supabase.from('products').insert([productRow]);
```

### NEW CODE:
```javascript
await productService.create(productRow);
```

---

## Step 4: Update Product Delete (Line ~4258)

### OLD CODE:
```javascript
const { error } = await supabase.from('products').delete().eq('id', id);
```

### NEW CODE:
```javascript
await productService.delete(id);
```

---

## Step 5: Update Order Creation (Find where orders are inserted)

### OLD CODE (if it looks like this):
```javascript
const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
```

### NEW CODE:
```javascript
// Create complete order with items
const orderData = {
  user_id: userId,
  customer_name: customerName,
  customer_email: customerEmail,
  customer_phone: customerPhone,
  delivery_address: deliveryAddress,
  total_amount: totalAmount,
  status: 'pending'
};

const order = await orderService.create(orderData, orderItemsToInsert);
console.log('✅ Order created:', order.id);
```

---

## Step 6: Update Categories Fetching

### Find any code that looks like:
```javascript
const { data, error } = await supabase.from('categories').select('*');
```

### Replace with:
```javascript
const categories = await categoryService.getAll();
```

---

## Step 7: Add Carousel/Hero Slides Loading

### Find your useEffect or initialization function and add:
```javascript
// Load carousel slides
try {
  const slides = await carouselService.getAll();
  setCarouselSlides(slides); // You'll need to add this state
  console.log('🎠 Carousel loaded:', slides.length, 'slides');
} catch (error) {
  console.error('❌ Error loading carousel:', error);
}
```

---

## Complete Migration Function Example

Here's a complete example of how your main data loading function should look:

```javascript
async function loadAllAppData() {
  console.log('🚀 Loading all app data...');
  
  try {
    // Load products and categories in parallel
    const [productsData, categoriesData, carouselData] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      carouselService.getAll()
    ]);

    console.log('✅ Products loaded:', productsData.length);
    console.log('✅ Categories loaded:', categoriesData.length);
    console.log('✅ Carousel loaded:', carouselData.length);

    // Build category mappings
    const catIdToNameMap = {};
    const catNameToId = {};
    const catNameToImageMap = {};
    const categoryNames = [];

    categoriesData.forEach(cat => {
      if (cat.id && cat.name) {
        catIdToNameMap[cat.id] = cat.name;
        catNameToId[cat.name.toLowerCase()] = cat.id;
      }
      if (cat.image_url) {
        catNameToImageMap[cat.name] = cat.image_url;
      }
      if (cat.name) {
        categoryNames.push(cat.name);
      }
    });

    // Process products
    const processedProducts = productsData
      .map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock_quantity: product.stock_quantity,
        tag: product.tag,
        image_url: product.image_url,
        category_id: product.category_id,
        category_name: catIdToNameMap[product.category_id] || 'Unknown',
        
        // Medicine-specific fields
        form: product.form,
        dosage_strength: product.dosage_strength,
        pack_sizes: product.pack_sizes,
        requires_prescription: product.requires_prescription,
        active_ingredient: product.active_ingredient,
        manufacturer: product.manufacturer,
        storage_info: product.storage_info,
        is_featured: product.is_featured,
        
        position: product.position
      }))
      .filter(p => p.name)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    // Update state
    setProducts(processedProducts);
    setCategories(categoriesData);
    setCategoryMappings({
      idToName: catIdToNameMap,
      nameToId: catNameToId,
      nameToImage: catNameToImageMap,
      names: categoryNames
    });
    setCarouselSlides(carouselData);

    console.log('✅ All data loaded and processed successfully');
    return true;

  } catch (error) {
    console.error('❌ Error loading app data:', error);
    
    // Handle authentication errors
    if (error.message?.includes('JWT') || error.message?.includes('expired')) {
      console.log('🔐 Session expired, signing out...');
      await supabase.auth.signOut();
    }
    
    return false;
  }
}
```

---

## Testing Checklist

After making these changes, test:

- [ ] Products load and display correctly
- [ ] Categories filter works
- [ ] Search functionality works
- [ ] Add to cart works
- [ ] Checkout creates orders in Supabase
- [ ] Admin can add new products
- [ ] Admin can delete products
- [ ] Carousel/hero slides display
- [ ] Medicine-specific fields (form, dosage, pack sizes) display
- [ ] Prescription badge shows for Rx items

---

## Medicine-Specific Display Updates

Don't forget to update your product card UI to show medicine fields:

```javascript
// In your product card component
<Text style={styles.productForm}>{product.form}</Text>
<Text style={styles.productDosage}>{product.dosage_strength}</Text>

{product.requires_prescription && (
  <View style={styles.rxBadge}>
    <Text style={styles.rxText}>℞ Prescription Required</Text>
  </View>
)}

{product.pack_sizes && product.pack_sizes.length > 0 && (
  <View style={styles.packSizes}>
    {product.pack_sizes.map((size, idx) => (
      <Pressable 
        key={idx}
        style={[
          styles.packSizeButton,
          selectedPackSize === size && styles.packSizeSelected
        ]}
        onPress={() => setSelectedPackSize(size)}
      >
        <Text>{size}</Text>
      </Pressable>
    ))}
  </View>
)}

<Text style={styles.manufacturer}>by {product.manufacturer}</Text>
```

---

## Error Handling Pattern

Use this pattern throughout your code:

```javascript
try {
  // Service call
  const data = await productService.getAll();
  setProducts(data);
} catch (error) {
  console.error('Error:', error.message);
  
  // Show user-friendly message
  Alert.alert(
    'Error Loading Data',
    'Unable to load products. Please check your internet connection and try again.',
    [{ text: 'OK' }]
  );
}
```

---

## Summary

**What Changed:**
- ❌ No more direct `supabase.from('table')` calls scattered everywhere
- ✅ Clean, centralized service layer for all data access
- ✅ Better error handling
- ✅ Easier to maintain and test
- ✅ All 20 tables now accessible

**Benefits:**
1. **Code Organization** - All database logic in one place
2. **Reusability** - Use same functions throughout app
3. **Type Safety** - Easier to add TypeScript later
4. **Error Handling** - Consistent error handling patterns
5. **Testing** - Mock services for testing
6. **Maintenance** - Single place to update if Supabase schema changes

Your app is now fully connected to all Supabase tables! 🎉
