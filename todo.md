# HUB PSB - TODO

## Backend
- [x] Schema: tabela `hub_users` com login, senha hash, role, ativo
- [x] Seed automático do admin (fredmatos / Thor40302010)
- [x] Procedure: login com username/password retornando JWT próprio
- [x] Procedure: logout (limpar cookie)
- [x] Procedure: me (retornar usuário logado)
- [x] Procedure: listar usuários (admin only)
- [x] Procedure: criar usuário (admin only)
- [x] Procedure: editar usuário (admin only)
- [x] Procedure: deletar/desativar usuário (admin only)

## Frontend
- [x] Tela de login (estilo Tipográfico Internacional)
- [x] Painel principal com botões "Mapa de Votação" e "Monitoramento de Notícias"
- [x] Menu de navegação entre as duas funcionalidades
- [x] Painel administrativo: listar usuários
- [x] Painel administrativo: criar novo usuário
- [x] Painel administrativo: editar/desativar usuário
- [x] Sessão persistente (cookie httpOnly, longa duração)
- [x] Proteção de rotas (redirecionar para login se não autenticado)

## Design
- [x] Estilo Tipográfico Internacional: branco, vermelho, preto
- [x] Grid rigoroso com linhas finas e espaço negativo
- [x] Tipografia sans-serif nítida
- [x] Layout assimétrico e funcional

## Testes
- [x] Teste de login com credenciais corretas
- [x] Teste de login com credenciais incorretas
- [x] Teste de criação de usuário (admin)
- [x] Teste de acesso negado para não-admin
