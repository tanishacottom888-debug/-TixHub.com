// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
const SUPABASE_URL = 'https://ccopagnxjauxlokyyzuw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_92kuIQT-82cfekghiuPJiA_ixLVsKa5';

// Initialize Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized');

// ============================================================
// AUTH FUNCTIONS
// ============================================================

// Sign Up - Simplified
async function signUp(email, password, fullName) {
    try {
        console.log('📤 Signing up:', email);
        
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

        // Try to create profile - but don't fail if it doesn't work
        if (data.user) {
            try {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            full_name: fullName,
                            created_at: new Date().toISOString()
                        }
                    ]);
                
                if (profileError) {
                    console.warn('⚠️ Profile warning:', profileError.message);
                    // Profile failed but user is created - still return success
                } else {
                    console.log('✅ Profile created');
                }
            } catch (e) {
                console.warn('⚠️ Profile error:', e.message);
                // Don't fail the whole signup
            }
        }

        return { success: true, data: data };
        
    } catch (error) {
        console.error('❌ Signup error:', error.message);
        return { success: false, error: error.message };
    }
}

// Sign In
async function signIn(email, password) {
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
}

// Reset Password
async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Reset password error:', error.message);
        return { success: false, error: error.message };
    }
}

// Get Current User
async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return { success: true, user: user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Sign Out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Check if logged in
async function isLoggedIn() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    } catch (error) {
        return false;
    }
}

// ============================================================
// MAKE FUNCTIONS GLOBAL
// ============================================================
window.supabase = supabase;
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
window.resetPassword = resetPassword;
window.isLoggedIn = isLoggedIn;

console.log('🔐 TixHub Auth Functions Ready');
console.log('📦 Available: signUp, signIn, signOut, resetPassword');
