const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ACCOUNTS = [
  {
    email: 'admin@tnpsc.local',
    password: 'AdminPassword123!',
    simplePassword: 'admin123',
    role: 'admin',
    name: 'Platform Administrator'
  },
  {
    email: 'learner1@tnpsc.local',
    password: 'LearnerPassword123!',
    simplePassword: 'learner123',
    role: 'learner',
    name: 'Learner 1'
  },
  {
    email: 'learner2@tnpsc.local',
    password: 'LearnerPassword123!',
    simplePassword: 'learner123',
    role: 'learner',
    name: 'Learner 2'
  }
];

async function updatePasswords() {
  console.log('Listing users...');
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('List error:', listErr);
    return;
  }

  console.log(`Found ${list.users.length} auth users`);

  for (const acc of ACCOUNTS) {
    const existing = list.users.find(u => u.email === acc.email);
    if (existing) {
      console.log(`Updating password for ${acc.email}...`);
      const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
        password: acc.password,
        email_confirm: true
      });
      if (error) {
        console.error(`Failed to update ${acc.email}:`, error);
      } else {
        console.log(`Password set for ${acc.email}: ${acc.password}`);
      }
    } else {
      console.log(`Creating user ${acc.email}...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: { full_name: acc.name, role: acc.role }
      });
      if (error) console.error(`Create error:`, error);
      else console.log(`Created ${acc.email}`);
    }
  }
}

updatePasswords();

