# PersonalOps V1.2 — Plano de Testes (QA Validation)

Este documento descreve os passos manuais para testar a camada de dados sintéticos e as rotinas de sincronização offline do PersonalOps na versão V1.2.

---

## 1. Preparação do Ambiente
1. Abra a aplicação no navegador (servidor local ou GitHub Pages).
2. Pressione `F12` para abrir o Google Chrome DevTools (ou equivalente).
3. Vá para a aba **Application** (ou **Storage**).
4. Clique em **Clear Site Data** para limpar caches de Service Worker e o `localStorage`.
5. Recarregue a página (`Ctrl + F5`).
6. Verifique no console que as mensagens `[DataStore] Loaded ... from network/disk` (ou avisos de fallbacks) são exibidos sem erros críticos.

---

## 2. Roteiro de Testes por Perfil

### Cenário A: Validação Administrativa (Admin)
1. Na tela de login, clique no pill **Administrativo** (ou insira `admin@personalops.test` / `admin123`).
2. Clique em **Entrar**.
3. **Métricas**: Na aba *Visão Geral*, verifique se os contadores exibem:
   - Perfis ativos: `3`
   - Professores: `2`
   - Alunos mockados: `16`
   - Treinos registrados: `8` (baseado no histórico de eventos concluídos)
4. **Tabela**: Vá para a aba *Usuários* e valide se a tabela renderiza dinamicamente a listagem de usuários com e-mails e cargos corretos.

### Cenário B: Validação do Treinador (Professor)
1. Faça logout e clique no pill **Professor** (ou insira `professor@personalops.test` / `prof123`).
2. **Dashboard**: Valide se a saudação indica *"Olá, Prof. Silva"*.
3. **Métricas**: Verifique se o painel exibe `8` alunos ativos (estudantes vinculados a `prof-01`).
4. **Listagem**: Vá em *Alunos*. Valide se os 8 alunos corretos são exibidos com suas respectivas notas e níveis de risco (ex: Pedro Lima em *Médio Risco*).
5. **Feedbacks**: Vá em *Feedbacks*. Valide se os comentários recentes e tags de atenção (como a dor no ombro de Carlos Mendes) aparecem estruturados.

### Cenário C: Execução do Aluno e Modo Offline (Aluno)
1. Faça logout e clique no pill **Aluno** (ou insira `aluno@personalops.test` / `aluno123`).
2. **Saudação**: Valide a mensagem *"Olá, Carlos. Bom treino hoje."*
3. **Iniciar Treino**: No card central ou aba *Treino de Hoje*, clique em **Iniciar treino**. Valide se a lista exibe a planilha dinâmica (4 exercícios para hoje).
4. **Executar**: Clique em **Executar** no primeiro exercício ("Supino Reto com Barra").
5. **Orientações**: Valide se as dicas de execução, segurança e erros comuns carregados do catálogo são exibidas abaixo do registro de séries.
6. **Registrar Série**: Insira os valores de carga (`60`), reps (`10`), RPE (`8`) e clique em **Registrar série**.
   - O cronômetro de descanso de 120 segundos deve ser ativado.
   - O log de séries registradas deve mostrar o registro "S1: 60kg · 10 reps · RPE 8".
7. **Simulação Offline**:
   - No DevTools, aba **Network**, marque a opção **Offline**.
   - Digite carga (`60`) e reps (`10`) na tela do treino e registre outra série.
   - Valide se o item no log de séries mostra a badge amarela `"offline"`.
   - Valide se o indicador de fila offline aparece no final da página indicando *"1 evento na fila offline"*.
8. **Reconexão**:
   - Reative a rede (desmarque **Offline** no DevTools).
   - O indicador de fila offline deve desaparecer em segundos e a sincronização deve ser confirmada no console com a mensagem `[PersonalOps] Synced 1 offline event(s)`.
9. **Finalização**: Complete todas as séries e exercícios para concluir o treino, retornando à tela inicial.

---

## 3. Critérios de Aceitação (Checklist final)
- [ ] O Service Worker ativa-se com sucesso e não impede o carregamento.
- [ ] Não existem erros do tipo `Uncaught ReferenceError` ou `Cannot read property of undefined` no console.
- [ ] Manequim 3D/CSS destaca as musculaturas corretas de acordo com a categoria do exercício.
- [ ] O app funciona normalmente quando o fetch de arquivos JSON falha (exemplo: rodando via `file:///`).
- [ ] Toda a fila de eventos gravada localmente sincroniza ao retornar à rede sem corromper o histórico do usuário.
