// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
const SUPABASE_URL = 'https://ccopagnxjauxlokyyzuw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_92kuIQT-82cfekghiuPJiA_ixLVsKa5';

// Initialize Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized');

// ============================================================
// AUTH FUNCTIONS - GLOBALLY AVAILABLE
// ============================================================

// SIGN UP
window.signUp = async function(email, password, fullName) {
    console.log('🔐 signUp() called with:', email);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            console.error('❌ Signup error:', error.message);
            return { success: false, error: error.message };
        }

        console.log('✅ User created:', data.user?.id);
        return { success: true, data: data };
        
    } catch (error) {
        console.error('❌ Signup error:', error.message);
        return { success: false, error: error.message };
    }
};

// SIGN IN
window.signIn = async function(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Sign in error:', error.message);
        return { success: false, error: error.message };
    }
};

// RESET PASSWORD
window.resetPassword = async function(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Reset password error:', error.message);
        return { success: false, error: error.message };
    }
};

// SIGN OUT
window.signOut = async function() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

console.log('🔐 TixHub Auth Functions Ready');
console.log('📦 Available: signUp, signIn, signOut, resetPassword');
