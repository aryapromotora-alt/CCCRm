# ProposalCRM - TODO

## Fase 1: Modelo de Dados e Autenticação
- [x] Definir schema do banco de dados (Usuários, Propostas, Comissões)
- [x] Implementar migrações do banco de dados
- [x] Configurar autenticação e roles (Admin/Usuário Comum)
- [x] Criar helpers de query no server/db.ts

## Fase 2: API Backend (tRPC Procedures)
- [x] Criar procedures para gerenciar usuários (admin only)
- [x] Criar procedures para gerenciar comissões por usuário/banco/tipo
- [x] Criar procedures para cadastrar propostas
- [x] Criar procedures para listar propostas (com controle de acesso)
- [x] Criar procedures para editar/deletar propostas (com validação de propriedade)

## Fase 3: Interface Frontend - Dashboard
- [x] Criar layout principal com DashboardLayout
- [x] Implementar navegação por roles (Admin vs Usuário Comum)
- [x] Criar página de dashboard com estatísticas

## Fase 4: Interface Frontend - Cadastro de Propostas
- [x] Criar formulário de cadastro de propostas com campos:
  - Proposta (ID/Nome)
  - Parcela
  - Banco
  - Valor
  - Tipo (Novo, Refinanciamento, Portabilidade, Refin Portabilidade, Refin Carteira, FGTS, CLT, Outros)
  - Comissão (calculada automaticamente)
- [x] Implementar validação de formulário
- [x] Implementar cálculo automático de comissão

## Fase 5: Interface Frontend - Listagem de Propostas
- [x] Criar tabela de propostas com filtros
- [x] Implementar paginação
- [x] Adicionar ações (editar, deletar, visualizar)
- [x] Controle de acesso (Admin vê tudo, Usuário vê apenas as suas)

## Fase 6: Interface Frontend - Gestão de Usuários e Comissões (Admin)
- [x] Criar página de gerenciar usuários
- [x] Criar interface para adicionar/editar usuários
- [x] Criar página de gerenciar comissões
- [x] Criar interface para definir comissões por usuário/banco/tipo

## Fase 7: Testes e Polimento
- [ ] Testar fluxo completo de autenticação
- [ ] Testar controle de acesso
- [ ] Testar cálculo de comissão
- [ ] Testar histórico de propostas
- [ ] Polir UI/UX

## Fase 8: Deploy e GitHub
- [ ] Preparar documentação de deploy (Northflank)
- [ ] Criar arquivo .gitignore apropriado
- [ ] Criar README.md com instruções
- [ ] Fazer commit inicial no GitHub
