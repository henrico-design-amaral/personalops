# PersonalOps

> **AVISO:** Autenticacao e banco de dados sao completamente simulados (mockados). Nenhuma credencial real e verificada. Nenhum dado real e processado ou armazenado em servidor.

Prototipo estatico de validacao — V1 publicado em GitHub Pages.

**URL:** https://henrico-design-amaral.github.io/personalops/

## Acessos demo

| Perfil | E-mail | Senha |
|---|---|---|
| Administrativo | admin@personalops.test | admin123 |
| Professor | professor@personalops.test | prof123 |
| Aluno | aluno@personalops.test | aluno123 |

## Funcionalidades V1

- Login simulado com tres perfis
- Perfil Admin: visao geral, usuarios, hipoteses, configuracoes
- Perfil Professor: lista de alunos, criador de treino por texto livre, feedbacks
- Perfil Aluno: treino do dia, modo treino assistido, timer de descanso, registro de carga/reps/RPE, fila offline, evolucao, anamnese
- Boneco CSS com destaque muscular por exercicio
- Status online/offline e fila offline via localStorage
- Service Worker com cache basico

## Stack

HTML + CSS + JavaScript puro - sem dependencias. GitHub Pages.

## O que NAO existe nesta V1

- Autenticacao real (nao usar senhas reais aqui)
- Banco de dados (tudo e mockado)
- Backend/API
- Dados reais de alunos