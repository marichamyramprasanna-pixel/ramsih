import { createClient } from '@supabase/supabase-js';

const url = 'https://jdmgedjuphdtsqknlsrr.supabase.co';
const key = 'sb_publishable_OQvnOv3ELTZVNO2JwLydaw_y-wtg1N9';

const supabase = createClient(url, key);

async function test() {
  console.log('Testing connection to Supabase...');
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth test session:', authData, 'Auth error:', authError);

    const { data: nodeData, error: nodeError } = await supabase.from('nodes').select('*');
    if (nodeError) {
      console.log('Node table error:', nodeError.message);
    } else {
      console.log(`Success! Fetched ${nodeData ? nodeData.length : 0} nodes from Supabase table.`);
    }
  } catch (err) {
    console.error('Exception during test:', err);
  }
}

test();
