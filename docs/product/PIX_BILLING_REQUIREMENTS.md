# Pix Billing Requirements — PersonalOps V1.2

## Por que Pix entra primeiro

Pix manual mockado permite validar se professor e aluno entendem cobrança, vencimento, QR Code demonstrativo e copia e cola antes de integrar gateway real.

## Pix manual, QR estático e QR dinâmico

- Pix manual mockado: estado visual no app, sem transação.
- QR Code estático real: exigiria chave Pix real e risco operacional; fora da V1.
- QR Code dinâmico real: exigiria gateway, identificador de cobrança, callback e conciliação; fora da V1.

## Open Finance

Open Finance não entra na V1 porque exige consentimento, integração regulada e tratamento de dados financeiros reais. Esta versão não coleta nem processa dado real.

## Evolução para gateway

A arquitetura reserva `gatewayProvider` para `future-asaas`, `future-mercadopago`, `future-pagarme` e `future-open-finance`. A troca futura deve acontecer por uma camada `PaymentProvider`, com backend, logs de auditoria e webhook.

## LGPD e dados financeiros

Nenhum CPF, CNPJ, chave Pix, dado bancário ou aluno real deve ser publicado no GitHub Pages. Campos financeiros são mascarados e demonstrativos.
