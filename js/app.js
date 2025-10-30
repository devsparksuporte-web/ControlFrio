// Evento de login COM SELEÇÃO DE EMPRESA
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const companyId = document.getElementById('company').value;
    
    if (!email || !password || !companyId) {
        showAlert('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Mostrar loading
    loginText.textContent = 'Entrando...';
    loginSpinner.classList.remove('hidden');
    loginBtn.disabled = true;
    
    try {
        // 1. Fazer login com Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        console.log('✅ Login auth realizado:', currentUser.email);
        
        // 2. Verificar se usuário tem acesso à empresa selecionada
        const hasAccess = await checkUserCompanyAccess(currentUser.id, companyId);
        
        if (!hasAccess) {
            throw new Error('Usuário não tem acesso a esta empresa ou está inativo');
        }
        
        // 3. Buscar dados completos do perfil e empresa
        await fetchUserProfileAndCompany(companyId);
        
    } catch (error) {
        console.error('❌ Erro no login:', error);
        showAlert(error.message, 'error');
        await supabase.auth.signOut();
    } finally {
        // Restaurar botão
        loginText.textContent = 'Entrar';
        loginSpinner.classList.add('hidden');
        loginBtn.disabled = false;
    }
}

// Buscar perfil e empresa específica
async function fetchUserProfileAndCompany(companyId) {
    try {
        console.log('🔍 Buscando perfil e empresa...');
        
        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .eq('company_id', companyId)
            .single();
        
        if (profileError) throw profileError;
        
        userProfile = profile;
        console.log('✅ Perfil encontrado:', userProfile);
        
        // Buscar empresa selecionada
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();
        
        if (companyError) throw companyError;
        
        currentCompany = company;
        console.log('✅ Empresa selecionada:', currentCompany.name);
        
        // Mostrar aplicação
        showAppScreen();
        
    } catch (error) {
        console.error('💥 Erro ao buscar dados:', error);
        throw new Error('Erro ao carregar dados do usuário/empresa');
    }
}

// Criar empresa padrão - VERSÃO CORRIGIDA
async function createDefaultCompany() {
    try {
        const companyData = {
            name: 'Minha Empresa - ' + currentUser.email,
            cnpj: '00.000.000/' + Math.floor(1000 + Math.random() * 9000) + '-00',
            address: 'Endereço da Empresa',
            zip_code: '00000-000',
            city: 'São Paulo',
            state: 'SP',
            phone: '(11) 99999-9999',
            email: currentUser.email,
            status: 'active'
        };

        console.log('📦 Criando empresa com dados:', companyData);

        const { data: company, error } = await supabase
            .from('companies')
            .insert([companyData])
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erro ao criar empresa:', error);
            throw error;
        }

        console.log('✅ Empresa criada:', company);

        // Atualizar perfil do usuário
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
                company_id: company.id,
                full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0]
            })
            .eq('id', currentUser.id);
        
        if (updateError) {
            console.error('❌ Erro ao atualizar perfil:', updateError);
            // Tentar criar o perfil se não existir
            await createUserProfile(company.id);
        }
        
        currentCompany = company;
        userProfile = { ...userProfile, company_id: company.id };
        showAppScreen();
        
    } catch (error) {
        console.error('💥 Erro ao criar empresa padrão:', error);
        showAlert('Erro ao configurar empresa: ' + error.message, 'error');
    }
}

// Criar perfil do usuário se não existir
async function createUserProfile(companyId) {
    try {
        const { error } = await supabase
            .from('profiles')
            .insert([
                {
                    id: currentUser.id,
                    full_name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
                    role: 'admin',
                    company_id: companyId,
                    active: true
                }
            ]);
        
        if (error) throw error;
        
        console.log('✅ Perfil criado para usuário');
    } catch (error) {
        console.error('❌ Erro ao criar perfil:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando sistema...');
    
    // Configurar navegação por hash primeiro
    setupHashNavigation();
    
    // Carregar empresas para o login
    await loadCompaniesForLogin();
    
    // Verificar se já existe uma sessão ativa
    await checkUserSession();
    
    // Configurar eventos
    setupEventListeners();
    
    console.log('✅ Sistema inicializado');
});
