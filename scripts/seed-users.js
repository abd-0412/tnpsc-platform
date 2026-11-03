const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEFAULT_USERS = [
  {
    email: 'admin@tnpsc.local',
    password: 'AdminPassword123!',
    full_name: 'Platform Administrator',
    role: 'admin',
    preferred_language: 'ta'
  },
  {
    email: 'learner1@tnpsc.local',
    password: 'LearnerPassword123!',
    full_name: 'Learner 1 (Aspirant)',
    role: 'learner',
    preferred_language: 'ta',
    target_exam_id: 'group_4'
  },
  {
    email: 'learner2@tnpsc.local',
    password: 'LearnerPassword123!',
    full_name: 'Learner 2 (Aspirant)',
    role: 'learner',
    preferred_language: 'ta',
    target_exam_id: 'group_4'
  }
];

async function seedUsers() {
  console.log('Seeding initial 3 authorized accounts (1 Admin + 2 Learners)...');

  for (const userConfig of DEFAULT_USERS) {
    try {
      // Check if user already exists in auth
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;

      const existingAuthUser = listData.users.find(u => u.email === userConfig.email);
      let userId;

      if (!existingAuthUser) {
        console.log(`Creating auth user: ${userConfig.email}...`);
        const { data: newAuth, error: createError } = await supabase.auth.admin.createUser({
          email: userConfig.email,
          password: userConfig.password,
          email_confirm: true,
          user_metadata: { full_name: userConfig.full_name, role: userConfig.role }
        });
        if (createError) throw createError;
        userId = newAuth.user.id;
        console.log(`Created auth account: ${userConfig.email} (${userId})`);
      } else {
        userId = existingAuthUser.id;
        console.log(`User already exists in auth: ${userConfig.email} (${userId})`);
      }

      // Upsert profile in public.profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: userConfig.email,
          full_name: userConfig.full_name,
          role: userConfig.role,
          is_active: true,
          preferred_language: userConfig.preferred_language,
          target_exam_id: userConfig.target_exam_id || null,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;
      console.log(`Profile synced for ${userConfig.email} with role: [${userConfig.role}]`);
    } catch (err) {
      console.error(`Failed to seed user ${userConfig.email}:`, err.message);
    }
  }

  console.log('User provisioning complete!');
}

seedUsers();

