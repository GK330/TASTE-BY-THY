import { createClient } from '@supabase/supabase-js';

// Remplacez ces valeurs par celles de votre projet Supabase (Settings > API)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'VOTRE_SUPABASE_URL';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'VOTRE_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Structure de la table 'customers' attendue dans Supabase :
// id (int8, primary key), phone (text, unique), name (text), created_at (timestamptz)