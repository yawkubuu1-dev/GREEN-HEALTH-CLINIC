# Supabase Integration Guide

This guide shows you how to connect your React Native app to all Supabase tables using the centralized service layer.

## 📁 Service Layer Location
`/services/supabaseService.js`

## 🎯 Available Services

All Supabase tables are now accessible through organized service modules:

### Core E-commerce
- **productService** - Medicine products
- **categoryService** - Product categories
- **orderService** - Customer orders
- **profileService** - User profiles

### Content Management
- **carouselService** - Homepage carousel/slider
- **heroSlideService** - Hero section slides
- **blogService** - Blog posts
- **aboutService** - About page sections
- **serviceService** - Services offered
- **serviceFaqService** - Service FAQs
- **patientStoryService** - Patient testimonials

### Team & Contact
- **teamService** - Team members
- **serviceTeamService** - Team-service assignments
- **contactInfoService** - Contact information
- **contactSubmissionService** - Contact form submissions
- **milestoneService** - Clinic milestones

### Site Configuration
- **footerService** - Footer sections & links
- **sliderConfigService** - Slider settings

---

## 📖 Usage Examples

### 1. Import the Services

```javascript
// Import individual services
import { productService, categoryService, orderService } from './services/supabaseService';

// OR import all services as one object
import supabaseServices from './services/supabaseService';
```

### 2. Fetch Products (Medicine)

```javascript
// In your App.js or component
useEffect(() => {
  async function loadProducts() {
    try {
      // Get all products
      const products = await productService.getAll();
      setProducts(products);
      
      // Get featured products only
      const featured = await productService.getAll({ is_featured: true });
      setFeaturedProducts(featured);
      
      // Get products by category
      const categoryId = 'some-uuid';
      const categoryProducts = await productService.getAll({ 
        category_id: categoryId 
      });
      
      // Search products
      const searchResults = await productService.search('paracetamol');
      
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }
  
  loadProducts();
}, []);
```

### 3. Fetch Categories

```javascript
useEffect(() => {
  async function loadCategories() {
    try {
      const categories = await categoryService.getAll();
      setCategories(categories);
      
      // Create category name-to-ID mapping
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.name.toLowerCase()] = cat.id;
      });
      setCategoryMap(categoryMap);
      
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }
  
  loadCategories();
}, []);
```

### 4. Fetch Carousel/Hero Slides

```javascript
useEffect(() => {
  async function loadCarousel() {
    try {
      // Get carousel items
      const slides = await carouselService.getAll();
      setCarouselSlides(slides);
      
      // OR use hero_slides table
      const heroSlides = await heroSlideService.getAll();
      setHeroSlides(heroSlides);
      
    } catch (error) {
      console.error('Error loading carousel:', error);
    }
  }
  
  loadCarousel();
}, []);
```

### 5. Create an Order

```javascript
async function handleCheckout(cartItems, customerInfo) {
  try {
    const orderData = {
      user_id: customerInfo.userId,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      delivery_address: customerInfo.address,
      total_amount: calculateTotal(cartItems),
      status: 'pending',
      payment_method: 'cash_on_delivery'
    };
    
    const orderItems = cartItems.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      pack_size: item.selectedPackSize
    }));
    
    const order = await orderService.create(orderData, orderItems);
    console.log('Order created:', order.id);
    
    // Clear cart
    setCart([]);
    
  } catch (error) {
    console.error('Error creating order:', error);
    alert('Failed to place order');
  }
}
```

### 6. Fetch Blog Posts

```javascript
useEffect(() => {
  async function loadBlogPosts() {
    try {
      // Get published posts only
      const posts = await blogService.getAll({ is_published: true });
      setBlogPosts(posts);
      
      // Get specific post by slug
      const post = await blogService.getBySlug('health-benefits-of-vitamin-c');
      setCurrentPost(post);
      
    } catch (error) {
      console.error('Error loading blog:', error);
    }
  }
  
  loadBlogPosts();
}, []);
```

### 7. Fetch About Page Content

```javascript
useEffect(() => {
  async function loadAboutContent() {
    try {
      const sections = await aboutService.getAll();
      setAboutSections(sections);
      
    } catch (error) {
      console.error('Error loading about content:', error);
    }
  }
  
  loadAboutContent();
}, []);
```

### 8. Fetch Services & FAQs

```javascript
useEffect(() => {
  async function loadServices() {
    try {
      const services = await serviceService.getAll();
      setServices(services);
      
      // Get FAQs for a specific service
      const serviceId = services[0].id;
      const faqs = await serviceFaqService.getAll(serviceId);
      setFaqs(faqs);
      
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }
  
  loadServices();
}, []);
```

### 9. Fetch Team Members

```javascript
useEffect(() => {
  async function loadTeam() {
    try {
      const team = await teamService.getAll();
      setTeamMembers(team);
      
    } catch (error) {
      console.error('Error loading team:', error);
    }
  }
  
  loadTeam();
}, []);
```

### 10. Submit Contact Form

```javascript
async function handleContactSubmit(formData) {
  try {
    const submission = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      subject: formData.subject,
      is_read: false
    };
    
    await contactSubmissionService.create(submission);
    alert('Message sent successfully!');
    
    // Clear form
    setFormData({ name: '', email: '', phone: '', message: '' });
    
  } catch (error) {
    console.error('Error submitting contact form:', error);
    alert('Failed to send message');
  }
}
```

### 11. Fetch Contact Information

```javascript
useEffect(() => {
  async function loadContactInfo() {
    try {
      const info = await contactInfoService.get();
      setContactInfo(info);
      
      // Access: info.phone, info.email, info.address, etc.
      
    } catch (error) {
      console.error('Error loading contact info:', error);
    }
  }
  
  loadContactInfo();
}, []);
```

### 12. Fetch Patient Stories (Testimonials)

```javascript
useEffect(() => {
  async function loadTestimonials() {
    try {
      const stories = await patientStoryService.getAll();
      setPatientStories(stories);
      
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
  }
  
  loadTestimonials();
}, []);
```

### 13. Fetch Footer Content

```javascript
useEffect(() => {
  async function loadFooter() {
    try {
      const sections = await footerService.getSections();
      const items = await footerService.getItems();
      
      // Group items by section
      const footerData = sections.map(section => ({
        ...section,
        items: items.filter(item => item.section_id === section.id)
      }));
      
      setFooterContent(footerData);
      
    } catch (error) {
      console.error('Error loading footer:', error);
    }
  }
  
  loadFooter();
}, []);
```

### 14. Update Product (Admin)

```javascript
async function handleUpdateProduct(productId, updates) {
  try {
    const updated = await productService.update(productId, {
      price: 15.00,
      stock_quantity: 250,
      is_featured: true
    });
    
    console.log('Product updated:', updated);
    
    // Refresh products list
    const products = await productService.getAll();
    setProducts(products);
    
  } catch (error) {
    console.error('Error updating product:', error);
  }
}
```

### 15. Delete Product (Admin)

```javascript
async function handleDeleteProduct(productId) {
  try {
    await productService.delete(productId);
    
    // Refresh products list
    const products = await productService.getAll();
    setProducts(products);
    
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}
```

---

## 🔄 Replace Old Supabase Calls

### Before (Old Direct Queries)
```javascript
// ❌ Old way - scattered throughout code
const { data, error } = await supabase.from('products').select('*');
const { data: categories } = await supabase.from('categories').select('*');
```

### After (New Service Layer)
```javascript
// ✅ New way - centralized, clean, reusable
const products = await productService.getAll();
const categories = await categoryService.getAll();
```

---

## 🎨 Full Integration Example

Here's how to update your main App.js to use all services:

```javascript
import { useEffect, useState } from 'react';
import { 
  productService, 
  categoryService, 
  carouselService,
  orderService,
  blogService,
  aboutService,
  serviceService,
  teamService,
  contactInfoService,
  footerService
} from './services/supabaseService';

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [services, setServices] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);

      // Load all data in parallel
      const [
        productsData,
        categoriesData,
        carouselData,
        blogData,
        servicesData,
        teamData,
        contactData
      ] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        carouselService.getAll(),
        blogService.getAll({ is_published: true }),
        serviceService.getAll(),
        teamService.getAll(),
        contactInfoService.get()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setCarouselSlides(carouselData);
      setBlogPosts(blogData);
      setServices(servicesData);
      setTeamMembers(teamData);
      setContactInfo(contactData);

      console.log('✅ All data loaded successfully');

    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View>
      {/* Your app UI */}
    </View>
  );
}
```

---

## 🛡️ Error Handling Best Practices

Always wrap service calls in try-catch blocks:

```javascript
async function fetchData() {
  try {
    const data = await productService.getAll();
    setProducts(data);
  } catch (error) {
    console.error('Error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('JWT')) {
      // Session expired - redirect to login
      await supabase.auth.signOut();
    } else {
      // Show user-friendly error
      alert('Failed to load products. Please try again.');
    }
  }
}
```

---

## 📊 Performance Tips

1. **Load data in parallel when possible:**
```javascript
const [products, categories] = await Promise.all([
  productService.getAll(),
  categoryService.getAll()
]);
```

2. **Use filters to reduce data transfer:**
```javascript
// Only fetch what you need
const featured = await productService.getAll({ is_featured: true });
```

3. **Cache data when appropriate:**
```javascript
// Store in state to avoid repeated fetches
const [cachedProducts, setCachedProducts] = useState(null);

if (!cachedProducts) {
  const products = await productService.getAll();
  setCachedProducts(products);
}
```

---

## 🔌 Next Steps

1. Replace all direct `supabase.from()` calls in App.js with service methods
2. Test each feature (products, cart, orders, blog, etc.)
3. Add loading states for better UX
4. Implement error handling for all data fetches
5. Set up admin screens to manage content

---

## 📝 Summary

**All 20 Supabase tables are now connected:**

✅ about_sections
✅ blog_posts  
✅ carousel_items
✅ categories
✅ clinic_milestones
✅ contact_info
✅ contact_submissions
✅ footer_items
✅ footer_sections
✅ hero_slides
✅ order_items
✅ orders
✅ patient_stories
✅ products
✅ profiles
✅ service_faqs
✅ service_team
✅ services
✅ slider_config
✅ team_members

**You can now:**
- Fetch and display data from any table
- Create, update, and delete records
- Filter and search data
- Handle errors gracefully
- Build admin interfaces for content management
