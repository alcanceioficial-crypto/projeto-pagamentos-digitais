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

## 🗂 Estrutura do Repositório

```
projeto-pagamentos-digitais/
│
├── backend/
│   ├── src/
│   │   ├── server.js        # Inicialização do servidor
│   │   ├── app.js           # Configuração do Express
│   │   ├── routes/          # Rotas da aplicação
│   │   ├── controllers/     # Controladores (lógica das rotas)
│   │   ├── services/        # Serviços (pagamentos, email, tokens)
│   │   ├── config/          # Configurações gerais
│   │   └── utils/           # Funções utilitárias
│   │
│   ├── .env.example         # Exemplo de variáveis de ambiente
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── .gitignore
```

---

## 🔄 Metodologia de Desenvolvimento

O projeto segue o modelo **passo a passo**, sempre validando antes de avançar:

1. Backend base (Express funcionando)
2. Deploy no Render
3. Integração EFÍ (Sandbox)
4. Pagamento via PIX
5. Webhook de confirmação
6. Liberação automática de conteúdo
7. Débito e Crédito
8. Envio de email
9. Frontend

⚠️ Nenhuma etapa avança sem testes concluídos.

---

## 🔐 Segurança

* Conteúdos não possuem links públicos
* Acesso liberado apenas por:

  * Token único
  * Token com expiração (configurável)
* Tokens vinculados a email + produto
* Confirmação **exclusiva via webhook do banco**

---

## 🧪 Ambiente de Desenvolvimento

* Node.js (versão LTS recomendada)
* EFÍ / Gerencianet em **Sandbox**
* Testes locais antes do deploy

---

## 🚧 Status do Projeto

🟡 **Em desenvolvimen
