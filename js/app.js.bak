// Configuração do Supabase
const SUPABASE_URL = 'https://rukvaidffgqqoxplqiyx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1a3ZhaWRmZmdxcW94cGxxaXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzM3MTYsImV4cCI6MjA3NzQwOTcxNn0.JCpTcUw6n_POIowuS_kvIjz-VHeo7wnsrzcBaoRlpvI';

// Inicializar o cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado da aplicação
let currentUser = null;
let currentCompany = null;
let userProfile = null;
let editingCompanyId = null;
let editingUserId = null;

// Elementos da DOM
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const currentCompanyElement = document.getElementById('currentCompany');
const userNameElement = document.getElementById('userName');
const userRoleElement = document.getElementById('userRole');
const loginAlert = document.getElementById('loginAlert');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');

// Função para mostrar informações de demonstração
function showDemoInfo() {
    alert(`🌐 SISTEMA CONECTADO AO BANCO REAL

📊 Banco de dados: Supabase
🔗 URL: ${SUPABASE_URL}
📋 Tabelas: companies, profiles, tickets, budgets
🔐 Segurança: RLS ativado

💡 Para testar:
1. Faça login com suas credenciais
2. Cadastre empresas e usuários
3. Os dados serão salvos no banco real

🚀 Sistema pronto para produção!`);
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se já existe uma sessão ativa
    await checkUserSession();
    
    // Configurar navegação entre abas
    setupTabNavigation();
    
    // Configurar eventos
    setupEventListeners();
});

// Configurar eventos
function setupEventListeners() {
    // Empresas
    document.getElementById('addCompanyBtn').addEventListener('click', () => openCompanyModal());
    document.getElementById('saveCompanyBtn').addEventListener('click', () => saveCompany());
    document.getElementById('cancelCompanyBtn').addEventListener('click', () => closeCompanyModal());
    document.querySelector('#companyModal .close').addEventListener('click', () => closeCompanyModal());
    
    // Usuários
    document.getElementById('addUserBtn').addEventListener('click', () => openUserModal());
    document.getElementById('saveUserBtn').addEventListener('click', () => saveUser());
    document.getElementById('cancelUserBtn').addEventListener('click', () => closeUserModal());
    document.querySelector('#userModal .close').addEventListener('click', () => closeUserModal());
    
    // Login/Logout
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
}

// Verificar sessão do usuário
async function checkUserSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await fetchUserProfile();
    }
}

// Buscar perfil do usuário
async function fetchUserProfile() {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) throw error;
        
        userProfile = profile;
        
        // Buscar empresa
        if (userProfile.company_id) {
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .select('*')
                .eq('id', userProfile.company_id)
                .single();
            
            if (companyError) {
                console.warn('Empresa não encontrada:', companyError);
                await useFirstAvailableCompany();
                return;
            }
            
            currentCompany = company;
            showAppScreen();
        } else {
            await useFirstAvailableCompany();
        }
        
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        await supabase.auth.signOut();
    }
}

// Usar primeira empresa disponível
async function useFirstAvailableCompany() {
    try {
        const { data: companies, error } = await supabase
            .from('companies')
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        if (companies && companies.length > 0) {
            currentCompany = companies[0];
            
            // Atualizar perfil do usuário com a empresa
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ company_id: currentCompany.id })
                .eq('id', currentUser.id);
            
            if (updateError) console.warn('Erro ao atualizar perfil:', updateError);
            
            showAppScreen();
        } else {
            await createDefaultCompany();
        }
        
    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        await createDefaultCompany();
    }
}

// Criar empresa padrão
async function createDefaultCompany() {
    try {
        const { data: company, error } = await supabase
            .from('companies')
            .insert([
                {
                    name: 'Minha Empresa',
                    cnpj: '00.000.000/0001-00',
                    status: 'active'
                }
            ])
            .select()
            .single();
        
        if (error) throw error;
        
        // Atualizar perfil do usuário
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ company_id: company.id })
            .eq('id', currentUser.id);
        
        if (updateError) console.warn('Erro ao atualizar perfil:', updateError);
        
        currentCompany = company;
        userProfile.company_id = company.id;
        showAppScreen();
        
    } catch (error) {
        console.error('Erro ao criar empresa padrão:', error);
        showAlert('Erro ao configurar empresa.', 'error');
    }
}

// Configurar navegação entre abas
function setupTabNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu li[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Atualizar menu ativo
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar aba correspondente
            tabContents.forEach(tab => {
                tab.classList.remove('active');
                if (tab.id === tabName) {
                    tab.classList.add('active');
                    
                    // Carregar dados específicos da aba
                    if (tabName === 'users') {
                        loadUsersData();
                    } else if (tabName === 'tickets') {
                        loadTicketsData();
                    } else if (tabName === 'dashboard') {
                        loadDashboardData();
                    } else if (tabName === 'companies') {
                        loadCompaniesData();
                    }
                }
            });
        });
    });
}

// Evento de login
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showAlert('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Mostrar loading
    loginText.textContent = 'Entrando...';
    loginSpinner.classList.remove('hidden');
    loginBtn.disabled = true;
    
    try {
        // Fazer login com Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        await fetchUserProfile();
        
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert('Credenciais inválidas ou erro de conexão', 'error');
    } finally {
        // Restaurar botão
        loginText.textContent = 'Entrar';
        loginSpinner.classList.add('hidden');
        loginBtn.disabled = false;
    }
}

// Evento de logout
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        currentCompany = null;
        userProfile = null;
        
        showLoginScreen();
    } catch (error) {
        console.error('Erro no logout:', error);
    }
}

// ========== EMPRESAS ==========

// Função para abrir o modal de empresa
function openCompanyModal(company = null) {
    editingCompanyId = company ? company.id : null;
    
    const modal = document.getElementById('companyModal');
    const title = document.getElementById('companyModalTitle');
    
    if (company) {
        title.textContent = 'Editar Empresa';
        fillCompanyForm(company);
    } else {
        title.textContent = 'Nova Empresa';
        document.getElementById('companyForm').reset();
        document.getElementById('companyStatus').value = 'active';
    }
    
    modal.style.display = 'flex';
}

// Preencher formulário com dados da empresa
function fillCompanyForm(company) {
    document.getElementById('companyName').value = company.name || '';
    document.getElementById('companyCnpj').value = company.cnpj || '';
    document.getElementById('companyPhone').value = company.phone || '';
    document.getElementById('companyEmail').value = company.email || '';
    document.getElementById('companyAddress').value = company.address || '';
    document.getElementById('companyCity').value = company.city || '';
    document.getElementById('companyState').value = company.state || '';
    document.getElementById('companyStatus').value = company.status || 'active';
    document.getElementById('companyNotes').value = company.notes || '';
}

// Função para fechar o modal
function closeCompanyModal() {
    document.getElementById('companyModal').style.display = 'none';
    editingCompanyId = null;
}

// Função para salvar empresa
async function saveCompany() {
    const form = document.getElementById('companyForm');
    const saveBtn = document.getElementById('saveCompanyBtn');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const companyData = {
        name: document.getElementById('companyName').value,
        cnpj: document.getElementById('companyCnpj').value || null,
        phone: document.getElementById('companyPhone').value || null,
        email: document.getElementById('companyEmail').value || null,
        address: document.getElementById('companyAddress').value || null,
        city: document.getElementById('companyCity').value || null,
        state: document.getElementById('companyState').value || null,
        status: document.getElementById('companyStatus').value,
        notes: document.getElementById('companyNotes').value || null,
        updated_at: new Date().toISOString()
    };
    
    // Salvar loading
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<div class="spinner"></div> Salvando...';
    saveBtn.disabled = true;
    
    try {
        let result;
        
        if (editingCompanyId) {
            // Atualizar empresa existente
            result = await supabase
                .from('companies')
                .update(companyData)
                .eq('id', editingCompanyId);
        } else {
            // Criar nova empresa
            companyData.created_at = new Date().toISOString();
            result = await supabase
                .from('companies')
                .insert([companyData]);
        }
        
        if (result.error) throw result.error;
        
        showAlert(`Empresa ${editingCompanyId ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
        closeCompanyModal();
        loadCompaniesData();
        
    } catch (error) {
        console.error('Erro ao salvar empresa:', error);
        showAlert('Erro ao salvar empresa: ' + error.message, 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Função para carregar dados das empresas
async function loadCompaniesData() {
    try {
        const { data: companies, error } = await supabase
            .from('companies')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.querySelector('#companiesTable tbody');
        tbody.innerHTML = '';
        
        if (companies && companies.length > 0) {
            companies.forEach(company => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${company.name || 'Sem nome'}</td>
                    <td>${company.cnpj || '-'}</td>
                    <td>${company.phone || '-'}</td>
                    <td>${company.email || '-'}</td>
                    <td><span class="badge ${company.status === 'active' ? 'badge-active' : 'badge-inactive'}">${company.status === 'active' ? 'Ativa' : 'Inativa'}</span></td>
                    <td>${company.created_at ? new Date(company.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm btn-icon edit-company" title="Editar" data-id="${company.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon delete-company" title="${company.status === 'active' ? 'Desativar' : 'Ativar'}" data-id="${company.id}" data-status="${company.status}">
                            <i class="fas ${company.status === 'active' ? 'fa-ban' : 'fa-check'}"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Adicionar eventos aos botões
            setupCompanyActions(companies);
            
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhuma empresa cadastrada</td></tr>';
        }
        
    } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        showAlert('Erro ao carregar lista de empresas', 'error');
    }
}

// Configurar ações das empresas
function setupCompanyActions(companies) {
    document.querySelectorAll('.edit-company').forEach(btn => {
        btn.addEventListener('click', function() {
            const companyId = this.getAttribute('data-id');
            const company = companies.find(c => c.id === companyId);
            if (company) openCompanyModal(company);
        });
    });
    
    document.querySelectorAll('.delete-company').forEach(btn => {
        btn.addEventListener('click', async function() {
            const companyId = this.getAttribute('data-id');
            const currentStatus = this.getAttribute('data-status');
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            
            if (confirm(`Tem certeza que deseja ${newStatus === 'active' ? 'ativar' : 'desativar'} esta empresa?`)) {
                await toggleCompanyStatus(companyId, newStatus);
            }
        });
    });
}

// Função para alternar status da empresa
async function toggleCompanyStatus(companyId, newStatus) {
    try {
        const { error } = await supabase
            .from('companies')
            .update({ 
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', companyId);
        
        if (error) throw error;
        
        showAlert(`Empresa ${newStatus === 'active' ? 'ativada' : 'desativada'} com sucesso!`, 'success');
        loadCompaniesData();
        
    } catch (error) {
        console.error('Erro ao alterar status da empresa:', error);
        showAlert('Erro ao alterar status da empresa', 'error');
    }
}

// ========== USUÁRIOS ==========

// Função para abrir modal de usuário
async function openUserModal(user = null) {
    editingUserId = user ? user.id : null;
    
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    
    // Carregar empresas para o select
    await loadCompaniesForSelect();
    
    if (user) {
        title.textContent = 'Editar Usuário';
        fillUserForm(user);
    } else {
        title.textContent = 'Novo Usuário';
        document.getElementById('userForm').reset();
        document.getElementById('userStatus').value = 'active';
        document.getElementById('userPassword').required = false;
        document.getElementById('userConfirmPassword').required = false;
    }
    
    modal.style.display = 'flex';
}

// Função para carregar empresas no select
async function loadCompaniesForSelect() {
    try {
        const { data: companies, error } = await supabase
            .from('companies')
            .select('id, name')
            .eq('status', 'active')
            .order('name');
        
        if (error) throw error;
        
        const select = document.getElementById('userCompany');
        select.innerHTML = '<option value="">Selecione uma empresa</option>';
        
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        showAlert('Erro ao carregar lista de empresas', 'error');
    }
}

// Função para preencher formulário de usuário
function fillUserForm(user) {
    document.getElementById('userName').value = user.full_name || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userRole').value = user.role || '';
    document.getElementById('userCompany').value = user.company_id || '';
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userStatus').value = user.active ? 'active' : 'inactive';
    
    // Para edição, senha não é obrigatória
    document.getElementById('userPassword').required = false;
    document.getElementById('userConfirmPassword').required = false;
}

// Função para fechar modal de usuário
function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    editingUserId = null;
    
    // Restaurar required para senhas
    document.getElementById('userPassword').required = true;
    document.getElementById('userConfirmPassword').required = true;
}

// Função para salvar usuário
async function saveUser() {
    const form = document.getElementById('userForm');
    const saveBtn = document.getElementById('saveUserBtn');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const password = document.getElementById('userPassword').value;
    const confirmPassword = document.getElementById('userConfirmPassword').value;
    
    // Validar senha apenas para novos usuários
    if (!editingUserId && password !== confirmPassword) {
        showAlert('As senhas não coincidem!', 'error');
        return;
    }
    
    if (!editingUserId && password.length < 6) {
        showAlert('A senha deve ter pelo menos 6 caracteres!', 'error');
        return;
    }
    
    const userData = {
        full_name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        company_id: document.getElementById('userCompany').value,
        phone: document.getElementById('userPhone').value || null,
        active: document.getElementById('userStatus').value === 'active'
    };
    
    // Salvar loading
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<div class="spinner"></div> Salvando...';
    saveBtn.disabled = true;
    
    try {
        if (editingUserId) {
            // Editar usuário existente
            await updateUser(editingUserId, userData, password);
        } else {
            // Criar novo usuário
            await createUser(userData, password);
        }
        
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        showAlert('Erro ao salvar usuário: ' + error.message, 'error');
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Função para criar novo usuário
async function createUser(userData, password) {
    try {
        // 1. Criar usuário no Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: password,
            options: {
                data: {
                    full_name: userData.full_name,
                    role: userData.role
                }
            }
        });
        
        if (authError) throw authError;
        
        // 2. Criar perfil na tabela profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: authData.user.id,
                    full_name: userData.full_name,
                    email: userData.email,
                    role: userData.role,
                    company_id: userData.company_id,
                    phone: userData.phone,
                    active: userData.active
                }
            ]);
        
        if (profileError) throw profileError;
        
        showAlert('Usuário criado com sucesso!', 'success');
        closeUserModal();
        loadUsersData();
        
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        
        // Se falhar, tentar reverter criando apenas o perfil
        if (error.message.includes('already registered')) {
            showAlert('Este email já está cadastrado no sistema', 'error');
        } else {
            throw error;
        }
    }
}

// Função para atualizar usuário existente
async function updateUser(userId, userData, password) {
    try {
        // 1. Atualizar perfil na tabela profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: userData.full_name,
                role: userData.role,
                company_id: userData.company_id,
                phone: userData.phone,
                active: userData.active,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        
        if (profileError) throw profileError;
        
        // 2. Se houver senha, atualizar no Auth
        if (password) {
            const { error: authError } = await supabase.auth.updateUser({
                password: password
            });
            
            if (authError) {
                console.warn('Erro ao atualizar senha:', authError);
                // Não falhar a operação principal por causa da senha
            }
        }
        
        showAlert('Usuário atualizado com sucesso!', 'success');
        closeUserModal();
        loadUsersData();
        
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
    }
}

// Função para carregar dados dos usuários
async function loadUsersData() {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name');
        
        if (error) throw error;
        
        const tbody = document.querySelector('#usersTable tbody');
        tbody.innerHTML = '';
        
        if (users && users.length > 0) {
            // Buscar nomes das empresas
            const companyIds = [...new Set(users.map(u => u.company_id).filter(Boolean))];
            let companiesMap = {};
            
            if (companyIds.length > 0) {
                const { data: companies, error: companiesError } = await supabase
                    .from('companies')
                    .select('id, name')
                    .in('id', companyIds);
                
                if (!companiesError && companies) {
                    companiesMap = companies.reduce((map, company) => {
                        map[company.id] = company.name;
                        return map;
                    }, {});
                }
            }
            
            users.forEach(user => {
                const row = document.createElement('tr');
                const companyName = companiesMap[user.company_id] || 'Não vinculada';
                const isCurrentUser = user.id === currentUser?.id;
                
                row.innerHTML = `
                    <td>
                        ${user.full_name || 'Nome não informado'}
                        ${isCurrentUser ? ' <small>(Você)</small>' : ''}
                    </td>
                    <td>${user.email || 'Email não informado'}</td>
                    <td><span class="badge ${getRoleBadgeClass(user.role)}">${getRoleText(user.role)}</span></td>
                    <td>${companyName}</td>
                    <td><span class="badge ${user.active ? 'badge-active' : 'badge-inactive'}">${user.active ? 'Ativo' : 'Inativo'}</span></td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm btn-icon edit-user" title="Editar" data-id="${user.id}" ${isCurrentUser ? 'disabled' : ''}>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm btn-icon toggle-user" title="${user.active ? 'Desativar' : 'Ativar'}" data-id="${user.id}" data-active="${user.active}" ${isCurrentUser ? 'disabled' : ''}>
                            <i class="fas ${user.active ? 'fa-ban' : 'fa-check'}"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Configurar eventos dos botões
            setupUserActions(users);
            
        } else {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum usuário cadastrado</td></tr>';
        }
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showAlert('Erro ao carregar lista de usuários', 'error');
    }
}

// Configurar ações dos usuários
function setupUserActions(users) {
    // Botão editar
    document.querySelectorAll('.edit-user').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            const userId = this.getAttribute('data-id');
            const user = users.find(u => u.id === userId);
            if (user) openUserModal(user);
        });
    });
    
    // Botão ativar/desativar
    document.querySelectorAll('.toggle-user').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (this.disabled) return;
            
            const userId = this.getAttribute('data-id');
            const currentActive = this.getAttribute('data-active') === 'true';
            const newActive = !currentActive;
            
            const action = newActive ? 'ativar' : 'desativar';
            if (confirm(`Tem certeza que deseja ${action} este usuário?`)) {
                await toggleUserStatus(userId, newActive);
            }
        });
    });
}

// Função para alternar status do usuário
async function toggleUserStatus(userId, newActive) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ 
                active: newActive,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        
        if (error) throw error;
        
        showAlert(`Usuário ${newActive ? 'ativado' : 'desativado'} com sucesso!`, 'success');
        loadUsersData();
        
    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        showAlert('Erro ao alterar status do usuário', 'error');
    }
}

// ========== DASHBOARD E OUTRAS FUNÇÕES ==========

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        // Buscar estatísticas de chamados
        const { data: tickets, error: ticketsError } = await supabase
            .from('tickets')
            .select('*')
            .eq('company_id', currentCompany.id);
        
        let openTickets = 0;
        let inProgressTickets = 0;
        
        if (!ticketsError && tickets) {
            openTickets = tickets.filter(t => t.status === 'open').length;
            inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
        }
        
        // Buscar orçamentos
        const { data: budgets, error: budgetsError } = await supabase
            .from('budgets')
            .select('*')
            .eq('company_id', currentCompany.id);
        
        let pendingBudgets = 0;
        if (!budgetsError && budgets) {
            pendingBudgets = budgets.filter(b => b.status === 'pending').length;
        }
        
        // Buscar transações financeiras
        const { data: transactions, error: transactionsError } = await supabase
            .from('financial_transactions')
            .select('*')
            .eq('company_id', currentCompany.id)
            .eq('type', 'revenue')
            .eq('status', 'paid');
        
        let monthlyRevenue = 0;
        if (!transactionsError && transactions) {
            monthlyRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.value || 0), 0);
        }
        
        // Atualizar cards
        document.getElementById('openTickets').textContent = openTickets;
        document.getElementById('inProgressTickets').textContent = inProgressTickets;
        document.getElementById('pendingBudgets').textContent = pendingBudgets;
        document.getElementById('monthlyRevenue').textContent = `R$ ${monthlyRevenue.toFixed(2)}`;
        
        // Atualizar tabela de chamados
        if (tickets) {
            updateTicketsTable(tickets.slice(0, 5));
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    }
}

// Atualizar tabela de chamados
function updateTicketsTable(tickets) {
    const tbody = document.querySelector('#ticketsTable tbody');
    tbody.innerHTML = '';
    
    if (tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum chamado encontrado</td></tr>';
        return;
    }
    
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        const statusClass = getStatusClass(ticket.status);
        const priorityClass = getPriorityClass(ticket.priority);
        
        row.innerHTML = `
            <td>${ticket.ticket_number || ticket.id.substring(0, 8)}</td>
            <td>Cliente #${ticket.client_id ? ticket.client_id.substring(0, 8) : 'N/A'}</td>
            <td>${ticket.title || 'Sem título'}</td>
            <td>Técnico</td>
            <td><span class="priority ${priorityClass}"></span> ${getPriorityText(ticket.priority)}</td>
            <td><span class="status ${statusClass}">${getStatusText(ticket.status)}</span></td>
            <td>${ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('pt-BR') : '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Carregar dados dos chamados
async function loadTicketsData() {
    try {
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('company_id', currentCompany.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const tbody = document.querySelector('#allTicketsTable tbody');
        tbody.innerHTML = '';
        
        if (tickets && tickets.length > 0) {
            tickets.forEach(ticket => {
                const row = document.createElement('tr');
                const statusClass = getStatusClass(ticket.status);
                const priorityClass = getPriorityClass(ticket.priority);
                
                row.innerHTML = `
                    <td>${ticket.ticket_number || ticket.id.substring(0, 8)}</td>
                    <td>Cliente #${ticket.client_id ? ticket.client_id.substring(0, 8) : 'N/A'}</td>
                    <td>${ticket.title || 'Sem título'}</td>
                    <td>Técnico</td>
                    <td><span class="priority ${priorityClass}"></span> ${getPriorityText(ticket.priority)}</td>
                    <td><span class="status ${statusClass}">${getStatusText(ticket.status)}</span></td>
                    <td>${ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm btn-icon" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum chamado encontrado</td></tr>';
        }
        
    } catch (error) {
        console.error('Erro ao carregar chamados:', error);
    }
}

// ========== FUNÇÕES AUXILIARES ==========

function getStatusClass(status) {
    const statusMap = {
        'open': 'open',
        'in_progress': 'in-progress',
        'completed': 'completed',
        'waiting_parts': 'waiting'
    };
    return statusMap[status] || 'open';
}

function getStatusText(status) {
    const statusMap = {
        'open': 'Aberto',
        'in_progress': 'Em Andamento',
        'completed': 'Finalizado',
        'waiting_parts': 'Aguardando Peças'
    };
    return statusMap[status] || 'Aberto';
}

function getPriorityClass(priority) {
    const priorityMap = {
        'low': 'low',
        'medium': 'medium',
        'high': 'high',
        'urgent': 'high'
    };
    return priorityMap[priority] || 'medium';
}

function getPriorityText(priority) {
    const priorityMap = {
        'low': 'Baixa',
        'medium': 'Média',
        'high': 'Alta',
        'urgent': 'Urgente'
    };
    return priorityMap[priority] || 'Média';
}

function getRoleBadgeClass(role) {
    const roleMap = {
        'admin': 'badge-admin',
        'technician': 'badge-technician',
        'attendant': 'badge-attendant'
    };
    return roleMap[role] || 'badge-admin';
}

function getRoleText(role) {
    const roleMap = {
        'admin': 'Administrador',
        'technician': 'Técnico',
        'attendant': 'Atendente'
    };
    return roleMap[role] || 'Administrador';
}

function showAlert(message, type) {
    loginAlert.textContent = message;
    loginAlert.className = `alert alert-${type}`;
    loginAlert.style.display = 'block';
    
    setTimeout(() => {
        loginAlert.style.display = 'none';
    }, 5000);
}

function updateUI() {
    userNameElement.textContent = userProfile.full_name || currentUser.email;
    userRoleElement.textContent = getRoleText(userProfile.role);
    currentCompanyElement.textContent = currentCompany.name;
}

function showAppScreen() {
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    
    updateUI();
    loadDashboardData();
    
    // Mostrar/ocultar funcionalidades baseadas no perfil
    const adminOnly = document.querySelectorAll('.admin-only');
    const adminAttendant = document.querySelectorAll('.admin-attendant');
    const adminAttendantCards = document.querySelectorAll('.admin-attendant-card');
    const adminAttendantBtns = document.querySelectorAll('.admin-attendant-btn');
    
    if (userProfile.role === 'technician') {
        adminOnly.forEach(el => el.style.display = 'none');
        adminAttendant.forEach(el => el.style.display = 'none');
        adminAttendantCards.forEach(el => el.style.display = 'none');
        adminAttendantBtns.forEach(el => el.style.display = 'none');
    } else if (userProfile.role === 'attendant') {
        adminOnly.forEach(el => el.style.display = 'none');
        adminAttendant.forEach(el => el.style.display = 'block');
        adminAttendantCards.forEach(el => el.style.display = 'block');
        adminAttendantBtns.forEach(el => el.style.display = 'block');
    } else {
        adminOnly.forEach(el => el.style.display = 'block');
        adminAttendant.forEach(el => el.style.display = 'block');
        adminAttendantCards.forEach(el => el.style.display = 'block');
        adminAttendantBtns.forEach(el => el.style.display = 'block');
    }
}

function showLoginScreen() {
    appScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}