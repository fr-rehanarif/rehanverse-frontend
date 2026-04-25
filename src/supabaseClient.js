import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eyzvdwsamwazwpqbargl.supabase.co';
const supabaseAnonKey = 'sb_publishable_tuKGrz-9Ed22UElb9k44PA_mAtgAt3I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);