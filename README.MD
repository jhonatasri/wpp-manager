# WPP Manager

Painel open source para gerenciamento de instâncias do **WPPConnect Server**.

O **WPP Manager** fornece uma interface moderna para visualizar, controlar e administrar múltiplas instâncias do WhatsApp conectadas ao servidor.

O projeto foi criado para facilitar o gerenciamento de automações WhatsApp em ambientes com múltiplas sessões.

---

## Preview

### Dashboard

![Dashboard](./docs/dashboard.jpeg)

### Instâncias

![Instâncias](./docs/instances.jpeg)

---

## Funcionalidades

- 📊 Dashboard com visão geral das instâncias
- 📱 Visualização de instâncias conectadas
- 🟢 Status em tempo real das conexões
- 🔄 Reinício de instâncias
- 🔌 Desconexão de sessões
- ➕ Criação de novas instâncias
- 📷 Conexão via QR Code
- 🔐 Autenticação via Token API
- ⚡ Atualização automática do status das instâncias

---

## Status das Instâncias

O painel identifica automaticamente o estado de cada instância:

| Status          | Descrição                     |
| --------------- | ----------------------------- |
| 🟢 Conectada    | WhatsApp conectado            |
| 🟡 Conectando   | Aguardando leitura de QR Code |
| 🔴 Desconectada | Instância offline             |

---

## Tecnologias Utilizadas

Este projeto foi construído com:

- **Next.js**
- **TypeScript**
- **TailwindCSS**
- **Shadcn UI**
- **Axios**
- **React Query**
- **Zustand**

---

## Integração

O sistema consome a API do:

**WPPConnect Server**

Documentação oficial:

https://github.com/wppconnect-team/wppconnect-server

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **WPPConnect Server** rodando (consulte a documentação oficial: https://github.com/wppconnect-team/wppconnect-server)

---

## Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/jhonatasri/wpp-manager.git
   cd wpp-manager
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure o ambiente:**
   - Certifique-se de que o **WPPConnect Server** está rodando (por padrão na porta 21465).
   - No painel do WPP Manager, acesse as configurações para definir:
     - **URL Base:** URL do seu servidor WPPConnect (ex: `http://localhost:21465`)
     - **Chave Secreta:** A secret key configurada no WPPConnect Server

4. **Execute o projeto:**

   Para desenvolvimento:

   ```bash
   npm run dev
   ```

   O projeto estará disponível em `http://localhost:3000`.

   Para produção:

   ```bash
   npm run build
   npm start
   ```

---

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
