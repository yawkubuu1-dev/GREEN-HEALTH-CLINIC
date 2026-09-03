require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testStockColumns() {
  console.log('Testing Supabase API for stock columns...\n');
  
  try {
    // Test 1: Query with wildcard
    console.log('Test 1: SELECT *');
    const { data: data1, error: error1 } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error1) {
      console.error('Error:', error1);
    } else {
      console.log('Columns returned:', Object.keys(data1[0] || {}));
      console.log('Has stock_s:', 'stock_s' in (data1[0] || {}));
      console.log('Has stock_m:', 'stock_m' in (data1[0] || {}));
      console.log('Has stock_l:', 'stock_l' in (data1[0] || {}));
      console.log('Has stock_xl:', 'stock_xl' in (data1[0] || {}));
      console.log('Has stock_xxl:', 'stock_xxl' in (data1[0] || {}));
    }
    
    console.log('\n---\n');
    
    // Test 2: Query with explicit column selection
    console.log('Test 2: SELECT *, stock_s, stock_m, stock_l, stock_xl, stock_xxl');
    const { data: data2, error: error2 } = await supabase
      .from('products')
      .select('*, stock_s, stock_m, stock_l, stock_xl, stock_xxl')
      .limit(1);
    
    if (error2) {
      console.error('Error:', error2);
    } else {
      console.log('Columns returned:', Object.keys(data2[0] || {}));
      console.log('Has stock_s:', 'stock_s' in (data2[0] || {}));
      console.log('Has stock_m:', 'stock_m' in (data2[0] || {}));
      console.log('Has stock_l:', 'stock_l' in (data2[0] || {}));
      console.log('Has stock_xl:', 'stock_xl' in (data2[0] || {}));
      console.log('Has stock_xxl:', 'stock_xxl' in (data2[0] || {}));
      
      if (data2[0] && 'stock_s' in data2[0]) {
        console.log('\nStock values:');
        console.log('stock_s:', data2[0].stock_s);
        console.log('stock_m:', data2[0].stock_m);
        console.log('stock_l:', data2[0].stock_l);
        console.log('stock_xl:', data2[0].stock_xl);
        console.log('stock_xxl:', data2[0].stock_xxl);
      }
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testStockColumns();
