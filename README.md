# 🚀 Plataforma de Pagamentos Digitais (PIX, Débito e Crédito)

Este projeto tem como objetivo a criação de uma **plataforma completa de venda de produtos digitais**, com **liberação automática de conteúdo apenas após confirmação de pagamento pelo banco (EFÍ/Gerencianet)**.

O desenvolvimento está sendo feito **em etapas curtas e testáveis**, garantindo estabilidade, segurança e fácil manutenção.

---

## 🎯 Objetivo do Projeto

Permitir que usuários:

* Acessem um site de produtos digitais
* Escolham um produto (PDF, curso, download, página protegida)
* Realizem o pagamento via:

  * 💠 PIX
  * 💳 Débito
  * 💳 Cartão de Crédito
* Tenham o conteúdo **liberado automaticamente somente após aprovação do banco**

---

## 🧱 Arquitetura Geral

### Backend

* **Node.js + Express**
* Integração com **EFÍ / Gerencianet**
* Webhooks para confirmação de pagamento
* Geração de tokens seguros para liberação de conteúdo
* Envio automático de emails

### Frontend (etapas futuras)

* Páginas públicas de produtos
* Checkout integrado ao backend
* Páginas protegidas por token

### Infraestrutura

* 📦 Repositório no **GitHub**
* 🚀 Deploy no **Render**
* 🔐 Variáveis de ambiente protegidas

---

🔄 Metodologia de Desenvolvimento

O projeto segue o modelo passo a passo, sempre validando antes de avançar:

Backend base (Express funcionando)

Deploy no Render

Integração EFÍ (Sandbox)

Pagamento via PIX

Webhook de confirmação

Liberação automática de conteúdo

Débito e Crédito

Envio de email

Frontend

⚠️ Nenhuma etapa avança sem testes concluídos.

🔐 Segurança

Conteúdos não possuem links públicos

Acesso liberado apenas por:

Token único

Token com expiração (configurável)

Tokens vinculados a email + produto

Confirmação exclusiva via webhook do banco

🧪 Ambiente de Desenvolvimento

Node.js (versão LTS recomendada)

EFÍ / Gerencianet em Sandbox

Testes locais antes do deploy
📌 Observações Importantes

O módulo de Teste de QI (PIX apenas) será tratado como projeto separado, ao final.

O projeto foi pensado para escalar facilmente.

A estrutura permite adicionar novos produtos sem refatorações grandes.

📞 Suporte / Evolução

Este projeto está sendo desenvolvido de forma guiada e incremental, com foco em:

Clareza

Segurança

Testabilidade

Manutenção a longo prazo
