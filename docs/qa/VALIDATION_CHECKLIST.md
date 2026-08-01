# Checklist de validação

## Local

- [x] `npm ci`
- [x] `npm run validate`
- [x] `npm audit --audit-level=high`
- [x] `npm run test:rls`
- [x] `npm run seed:dev`
- [x] `npm run test:e2e`
- [x] scan sem credenciais privadas ou fixture de produção

## Fluxos

- [x] autenticação, onboarding e persistência após reload
- [x] energia, prioridade, tarefa relacionada, agenda e conclusão
- [x] rotina, ocorrência e histórico
- [x] revisão, aprendizado, decisão e persistência
- [x] isolamento de leitura, alteração e identidade entre dois usuários
- [x] logout, novo login e proteção de rota sem sessão (repetir em produção)

## Interface

- [x] 390, 768, 1024 e 1440 px
- [x] navegação por teclado e foco visível
- [x] axe sem violações sérias ou críticas
- [x] carregamento, vazio, erro, sucesso, confirmação e offline
- [x] console sem erro e requests críticas sem falha

## Produção

- [ ] DNS e HTTPS do subdomínio
- [ ] assets e rotas
- [ ] Auth e redirect de recuperação
- [ ] CRUD real e persistência após reload
- [ ] logout/login
- [ ] mobile e desktop
- [ ] bundle sem chave privilegiada ou fixtures históricas
- [ ] GitHub Actions e Hostinger verdes
