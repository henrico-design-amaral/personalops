# Offline-first Architecture — PersonalOps

## Princípio

Nada que acontece durante o treino pode depender da internet.

## Deve funcionar offline

- Abrir treino já carregado;
- iniciar treino;
- visualizar exercícios previamente baixados;
- registrar série;
- registrar carga;
- registrar repetições;
- usar timer;
- finalizar treino;
- salvar feedback;
- enfileirar eventos para sincronização posterior.

## Pode exigir internet

- receber novo treino;
- atualizar biblioteca visual;
- sincronizar feedback;
- processar IA;
- publicar treino novo;
- autenticar sessão expirada.

## Modelo inicial

- Cache do treino do dia;
- armazenamento local de eventos;
- fila de sincronização;
- status claro de sincronização;
- prevenção de perda de dados;
- resolução simples de conflito.

## Risco

Offline-first mal feito cria sensação falsa de segurança. O produto deve mostrar claramente o que está salvo localmente, o que foi sincronizado e o que falhou.
