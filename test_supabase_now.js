// Quick test to verify Supabase connection works
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', url);
console.log('Key exists:', !!key);
console.log('');

if (!url || !key) {
  console.error('❌ Missing credentials!');
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  try {
    // Test 1: Check products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, form, dosage_strength, price')
      .limit(5);

    if (prodError) {
      console.error('❌ Products query error:', prodError.message);
    } else {
      console.log('✅ Products found:', products.length);
      console.log('Products:', JSON.stringify(products, null, 2));
    }

    // Test 2: Check categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('name')
      .limit(5);

    if (catError) {
      console.error('❌ Categories query error:', catError.message);
    } else {
      console.log('\n✅ Categories found:', categories.length);
      console.log('Categories:', categories.map(c => c.name).join(', '));
    }

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

test();
