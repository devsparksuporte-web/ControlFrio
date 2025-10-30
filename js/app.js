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
