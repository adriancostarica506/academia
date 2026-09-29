// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = 'https://ianektdgzoohzrktuzph.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbmVrdGRnem9vaHpya3R1enBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzQ1ODEsImV4cCI6MjEwNjIxMDU4MX0.dxV9ZmlFPuNVF5gTx5oURXrtOj1wRoIbLf5A1S99U8c';

// Inicializar el cliente de Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dominio virtual interno para permitir login solo con usuario
const USERNAME_DOMAIN = '@sistema.local';

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const errorMessage = document.getElementById('errorMessage');

function showError(msg) {
  if (!errorMessage) return;
  errorMessage.textContent = msg;
  errorMessage.classList.remove('hidden');
}

function clearError() {
  if (!errorMessage) return;
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

// ==========================================
// MANEJO DE INICIO DE SESIÓN
// ==========================================
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!username || !password) {
      showError('Por favor completa todos los campos.');
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = 'Verificando...';

    // Construir el email virtual con el dominio interno
    const internalEmail = `${username}${USERNAME_DOMAIN}`;

    try {
      // 1. Iniciar sesión en Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: internalEmail,
        password: password
      });

      if (authError) {
        throw new Error('Usuario o contraseña incorrectos.');
      }

      const userId = authData.user.id;

      // 2. Consultar el perfil y rol del usuario
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        throw new Error('No se encontró el perfil del usuario.');
      }

      // Guardar información en sesión
      sessionStorage.setItem('user_role', profile.role);
      sessionStorage.setItem('user_name', profile.full_name);

      // Redirigir al panel principal
      window.location.href = 'dashboard.html';

    } catch (err) {
      showError(err.message || 'Error al conectar con el servidor.');
      btnLogin.disabled = false;
      btnLogin.textContent = 'Ingresar al Sistema';
    }
  });
}
