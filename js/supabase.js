// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

// Your Supabase Credentials
const SUPABASE_URL = 'https://ccopagnxjauxlokyyzuw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_92kuIQT-82cfekghiuPJiA_ixLVsKa5';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client initialized');

// ============================================================
// AUTH FUNCTIONS
// ============================================================

// Sign Up
async function signUp(email, password, fullName) {
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

        if (error) throw error;

        // Create profile in profiles table
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
                    console.warn('⚠️ Profile creation warning:', profileError.message);
                } else {
                    console.log('✅ Profile created successfully');
                }
            } catch (profileErr) {
                console.warn('⚠️ Profile creation error:', profileErr.message);
            }
        }

        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Sign up error:', error.message);
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

// Sign Out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Sign out error:', error.message);
        return { success: false, error: error.message };
    }
}

// Get Current User
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (profileError) {
                return { success: true, user: user, profile: null };
            }
            
            return { success: true, user: user, profile: profile };
        }
        
        return { success: true, user: null, profile: null };
    } catch (error) {
        console.error('❌ Get user error:', error.message);
        return { success: false, error: error.message };
    }
}

// Reset Password
async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html',
        });
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Reset password error:', error.message);
        return { success: false, error: error.message };
    }
}

// Check if user is logged in
async function isLoggedIn() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    } catch (error) {
        console.error('❌ Check login error:', error.message);
        return false;
    }
}

// Get session
async function getSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    } catch (error) {
        console.error('❌ Get session error:', error.message);
        return null;
    }
}

// Auth state listener
function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event);
        callback(event, session);
    });
}

// ============================================================
// TICKET FUNCTIONS
// ============================================================

// Get all approved tickets
async function getTickets() {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('*, profiles(full_name)')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Get tickets error:', error.message);
        return { success: false, error: error.message };
    }
}

// Get tickets by category
async function getTicketsByCategory(category) {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('*, profiles(full_name)')
            .eq('event_category', category)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Get tickets by category error:', error.message);
        return { success: false, error: error.message };
    }
}

// Create ticket
async function createTicket(ticketData) {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .insert([ticketData])
            .select();

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Create ticket error:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================================
// FAVORITES FUNCTIONS
// ============================================================

// Add favorite
async function addFavorite(userId, ticketId) {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .insert([{ user_id: userId, ticket_id: ticketId }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Add favorite error:', error.message);
        return { success: false, error: error.message };
    }
}

// Remove favorite
async function removeFavorite(userId, ticketId) {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('ticket_id', ticketId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('❌ Remove favorite error:', error.message);
        return { success: false, error: error.message };
    }
}

// Get user favorites
async function getUserFavorites(userId) {
    try {
        const { data, error } = await supabase
            .from('favorites')
            .select('ticket_id, tickets(*)')
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('❌ Get favorites error:', error.message);
        return { success: false, error: error.message };
    }
}

// ============================================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================================================

// Make functions globally available
window.supabase = supabase;
window.signUp = signUp;
window.signIn = signIn;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
window.resetPassword = resetPassword;
window.isLoggedIn = isLoggedIn;
window.getSession = getSession;
window.onAuthStateChange = onAuthStateChange;
window.getTickets = getTickets;
window.getTicketsByCategory = getTicketsByCategory;
window.createTicket = createTicket;
window.addFavorite = addFavorite;
window.removeFavorite = removeFavorite;
window.getUserFavorites = getUserFavorites;

console.log('🔐 TixHub Supabase Client Ready');
console.log('📦 Functions available:');
console.log('   - signUp(email, password, fullName)');
console.log('   - signIn(email, password)');
console.log('   - signOut()');
console.log('   - getCurrentUser()');
console.log('   - resetPassword(email)');
console.log('   - isLoggedIn()');
console.log('   - getTickets()');
console.log('   - createTicket(ticketData)');
console.log('   - addFavorite(userId, ticketId)');
