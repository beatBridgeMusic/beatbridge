import { createClient } from '@supabase/supabase-js';

import dotenv from 'dotenv';
dotenv.config();
const url = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(url, serviceRoleKey);
export const supabaseAnon = createClient(url, anonKey);

//below are the built in supabase features
// const { data, error } = await supabase.auth.signUp({
//     email: 'example@email.com',
//     password: 'example-password',
//   })

//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: 'github'
//   })
// const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
//     redirectTo: 'https://example.com/update-password',
//   })
// const { data, error } = await supabase.auth.admin.createUser({
//     email: 'user@email.com',
//     password: 'password',
//     user_metadata: { name: 'Yoda' }
//   })
// const { data, error } = await supabase
//   .from('characters')
//   .select('name')
//   .match({ id: 2, name: 'Leia' })
// const { data, error } = await supabase.auth.signInWithPassword({
//     email: 'example@email.com',
//     password: 'example-password',
//   })
