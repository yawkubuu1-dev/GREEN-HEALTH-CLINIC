/**
 * Supabase Service Layer
 * Centralized data access for all Supabase tables
 */

import { supabase } from '../lib/supabase';

// ============================================
// PRODUCTS
// ============================================

export const productService = {
  // Get all products with optional filters
  async getAll(filters = {}) {
    let query = supabase.from('products').select('*, categories(name, description)');
    
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }
    if (filters.requires_prescription !== undefined) {
      query = query.eq('requires_prescription', filters.requires_prescription);
    }
    
    query = query.order('position', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get single product by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, description)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new product
  async create(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update product
  async update(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete product
  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Search products
  async search(searchTerm) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,active_ingredient.ilike.%${searchTerm}%`)
      .order('position');
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// CATEGORIES
// ============================================

export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// CAROUSEL / HERO SLIDES
// ============================================

export const carouselService = {
  async getAll() {
    const { data, error } = await supabase
      .from('carousel_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('carousel_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(slide) {
    const { data, error } = await supabase
      .from('carousel_items')
      .insert([slide])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('carousel_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('carousel_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// HERO SLIDES
// ============================================

export const heroSlideService = {
  async getAll() {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(slide) {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([slide])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('hero_slides')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// ORDERS
// ============================================

export const orderService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))');
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url, form, dosage_strength))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(order, orderItems) {
    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (orderError) throw orderError;

    // Create order items
    const itemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: orderData.id
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);
    
    if (itemsError) throw itemsError;
    
    return orderData;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// BLOG POSTS
// ============================================

export const blogService = {
  async getAll(filters = {}) {
    let query = supabase
      .from('blog_posts')
      .select('*');
    
    if (filters.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // getBySlug removed — no slug column exists.
  // Use getById(id) instead throughout the app.

  async create(post) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// ABOUT SECTIONS
// ============================================

export const aboutService = {
  async getAll() {
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .order('position', { ascending: true }); // Order by position for correct sequence
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('about_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// SERVICES
// ============================================

export const serviceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: true }); // Order by id instead of sort_order
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// SERVICE FAQS
// ============================================

export const serviceFaqService = {
  async getAll(serviceId = null) {
    let query = supabase
      .from('service_faqs')
      .select('*');
    
    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }
    
    query = query.order('sort_order', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(faq) {
    const { data, error } = await supabase
      .from('service_faqs')
      .insert([faq])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('service_faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('service_faqs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// TEAM MEMBERS
// ============================================

export const teamService = {
  async getAll() {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(member) {
    const { data, error } = await supabase
      .from('team_members')
      .insert([member])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// SERVICE TEAM
// ============================================

export const serviceTeamService = {
  async getAll(serviceId = null) {
    let query = supabase
      .from('service_team')
      .select('*, team_members(*)');
    
    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(assignment) {
    const { data, error } = await supabase
      .from('service_team')
      .insert([assignment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(serviceId, teamMemberId) {
    const { error } = await supabase
      .from('service_team')
      .delete()
      .eq('service_id', serviceId)
      .eq('team_member_id', teamMemberId);
    
    if (error) throw error;
  }
};

// ============================================
// PATIENT STORIES
// ============================================

export const patientStoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('patient_stories')
      .select('*')
      .eq('is_featured', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('patient_stories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(story) {
    const { data, error } = await supabase
      .from('patient_stories')
      .insert([story])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('patient_stories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('patient_stories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============================================
// CLINIC MILESTONES
// ============================================

export const milestoneService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clinic_milestones')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('clinic_milestones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// CONTACT INFO
// ============================================

export const contactInfoService = {
  async get() {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(updates) {
    const { data, error } = await supabase
      .from('contact_info')
      .update(updates)
      .eq('id', updates.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// CONTACT SUBMISSIONS
// ============================================

export const contactSubmissionService = {
  async create(submission) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([submission])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll(filters = {}) {
    let query = supabase
      .from('contact_submissions')
      .select('*');
    
    if (filters.is_read !== undefined) {
      query = query.eq('is_read', filters.is_read);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async markAsRead(id) {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// FOOTER SECTIONS & ITEMS
// ============================================

export const footerService = {
  async getSections() {
    const { data, error } = await supabase
      .from('footer_sections')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getItems(sectionId = null) {
    let query = supabase
      .from('footer_items')
      .select('*');
    
    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }
    
    query = query.order('sort_order', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async updateSection(id, updates) {
    const { data, error } = await supabase
      .from('footer_sections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateItem(id, updates) {
    const { data, error } = await supabase
      .from('footer_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// SLIDER CONFIG
// ============================================

export const sliderConfigService = {
  async get() {
    const { data, error } = await supabase
      .from('slider_config')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(updates) {
    const { data, error } = await supabase
      .from('slider_config')
      .update(updates)
      .eq('id', updates.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================
// PROFILES
// ============================================

export const profileService = {
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Export all services as a single object for convenience
export default {
  products: productService,
  categories: categoryService,
  carousel: carouselService,
  heroSlides: heroSlideService,
  orders: orderService,
  blog: blogService,
  about: aboutService,
  services: serviceService,
  serviceFaqs: serviceFaqService,
  team: teamService,
  serviceTeam: serviceTeamService,
  patientStories: patientStoryService,
  milestones: milestoneService,
  contactInfo: contactInfoService,
  contactSubmissions: contactSubmissionService,
  footer: footerService,
  sliderConfig: sliderConfigService,
  profiles: profileService
};
