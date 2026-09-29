// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = 'https://ianektdgzoohzrktuzph.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbmVrdGRnem9vaHpya3R1enBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzQ1ODEsImV4cCI6MjEwNjIxMDU4MX0.dxV9ZmlFPuNVF5gTx5oURXrtOj1wRoIbLf5A1S99U8c';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const userInput = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    if (!userInput || !password) {
      showError('Por favor completa todos los campos.');
      return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = 'Verificando...';

    let loginEmail = userInput;
    if (userInput === 'admin') {
      loginEmail = 'adrian2799024@yahoo.com';
    } else if (!userInput.includes('@')) {
      loginEmail = `${userInput}@sistema.local`;
    }

    try {
      // 1. Iniciar sesión en Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: loginEmail,
        password: password
      });

      if (authError) {
        throw new Error(authError.message || 'Usuario o contraseña incorrectos.');
      }

      // 2. Consultar perfil y rol
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role, full_name')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Error al cargar perfil: ' + (profileError ? profileError.message : 'no encontrado'));
      }

      // 3. Registrar última conexión activa
      await supabaseClient
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', authData.user.id);

      // 4. Guardar datos en la sesión del navegador
      sessionStorage.setItem('user_role', profile.role);
      sessionStorage.setItem('user_name', profile.full_name);

      // 5. Redirigir al panel principal
      window.location.href = 'dashboard.html';

    } catch (err) {
      showError(err.message || 'Error al conectar.');
      btnLogin.disabled = false;
      btnLogin.textContent = 'Ingresar al Sistema';
    }
  });
}
