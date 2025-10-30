# FrioControl - Sistema de Gestão

Sistema completo de gestão para empresas de manutenção de ar-condicionado.

## 🚀 Funcionalidades

- ✅ **Gestão de Empresas** - Cadastro completo de empresas
- ✅ **Gestão de Usuários** - Cadastro com vínculo a empresas
- ✅ **Controle de Chamados** - Abertura e acompanhamento
- ✅ **Orçamentos** - Criação e gestão de orçamentos
- ✅ **Financeiro** - Controle de receitas e despesas
- ✅ **Relatórios** - Relatórios gerenciais
- ✅ **Multi-perfil** - Admin, Técnico, Atendente

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deploy**: Netlify

## 📦 Deploy no Netlify

1. Faça push para o GitHub
2. Acesse [Netlify](https://netlify.com)
3. Conecte com GitHub e selecione o repositório
4. Deploy automático!

## 🔧 Configuração do Netlify

- **Production branch**: `main`
- **Build command**: (deixe vazio)
- **Publish directory**: (deixe vazio ou `.`)

## 📋 Estrutura do Banco

### Tabelas Principais:
- `companies` - Cadastro de empresas
- `profiles` - Perfis de usuários
- `tickets` - Chamados de serviço
- `budgets` - Orçamentos
- `financial_transactions` - Transações financeiras

## 👥 Perfis de Usuário

- **Administrador**: Acesso total ao sistema
- **Técnico**: Apenas chamados e dashboard
- **Atendente**: Clientes, financeiro e orçamentos

## 📞 Suporte

Desenvolvido por [DevSparkWeb](https://devsparkweb.netlify.app)