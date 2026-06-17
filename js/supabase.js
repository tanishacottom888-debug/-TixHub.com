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

// SIGN UP
async function signUp(email, password, fullName) {
    console.log('🔐 signUp() called for:', email);
    
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
        
        // Try to create profile (don't fail if it doesn't work)
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
                } else {
                    console.log('✅ Profile created');
                }
            } catch (e) {
                console.warn('⚠️ Profile error:', e.message);
            }
        }

        return { success: true, data: data };
        
    } catch (error) {
        console.error('❌ Signup error:', error.message);
        return { success: false, error: error.message };
    }
}

// SIGN IN
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

// RESET PASSWORD
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

// SIGN OUT
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================================
// MAKE FUNCTIONS GLOBAL - THIS IS THE FIX
// ============================================================
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.resetPassword = resetPassword;

console.log('🔐 TixHub Auth Functions Ready');
console.log('📦 Available: signUp, signIn, signOut, resetPassword');
