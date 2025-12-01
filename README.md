# 🏭 OEE Monitoring System

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-A22846?style=for-the-badge&logo=raspberrypi&logoColor=white)
![Node-RED](https://img.shields.io/badge/Node--RED-8F0000?style=for-the-badge&logo=nodered&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

**Sistema integrado de monitoramento de eficiência industrial (OEE) em tempo real**

📚 *Trabalho de Conclusão de Curso (TCC) — Engenharia de Computação — PUC-PR*

[Funcionalidades](#-funcionalidades) •
[Tecnologias](#-tecnologias) •
[Arquitetura](#-arquitetura) •
[Instalação](#-instalação)

</div>

---

## 📋 Sobre o Projeto

O **OEE Monitoring System** é um sistema completo de monitoramento de eficiência industrial desenvolvido como **Trabalho de Conclusão de Curso (TCC)** do curso de **Engenharia de Computação** e **Engenharia Elétrica** na **PUC-PR (2025)**.

O sistema foi projetado para calcular e exibir em tempo real os indicadores **OEE (Overall Equipment Effectiveness)**, integrando hardware físico com Raspberry Pi para simular máquinas industriais, comunicação IoT via Node-RED, backend robusto com Node.js/Express, banco de dados MongoDB e um dashboard web interativo com gráficos em tempo real, além de módulo completo de logística e ordens de produção.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| 📊 **Cálculo OEE em Tempo Real** | Disponibilidade, Performance e Qualidade calculados automaticamente |
| 🖥️ **Simulação com Raspberry Pi** | Hardware físico simulando máquinas industriais reais |
| 📡 **Telemetria IoT** | Coleta de RSSI, SNR e Latência enviada via HTTP para o backend Express |
| 📈 **Dashboard Interativo** | Visualização de dados com Chart.js em tempo real |
| 🚚 **Módulo de Logística** | Gestão completa de ordens de produção e entregas |
| 💾 **Persistência MongoDB** | Armazenamento seguro de todos os dados históricos |
| 🌐 **Interface Web Responsiva** | Acesso via navegador em qualquer dispositivo |
| ⚙️ **Configuração Flexível** | Parâmetros ajustáveis para diferentes cenários industriais |

---

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL

### IoT & Hardware
- **Raspberry Pi** - Simulação de máquinas industriais
- **Node-RED** - Simulação de ciclos de produção e eventos IoT

### Frontend
- **HTML/CSS/JavaScript** - Interface web
- **Chart.js** - Gráficos interativos em tempo real

### Infraestrutura
- **VPN** - Acesso remoto seguro

---

## 🏗️ Arquitetura

### Visão Geral do Sistema

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                       │
│  ┌──────────────┐    ┌──────────────────┐    ┌─────────────────────────┐   │
│  │     CSS      │    │    JavaScript    │    │     Páginas HTML        │   │
│  │  Estilos e   │    │  API calls,      │    │  index.html, dashboard, │   │
│  │    temas     │    │  Charts, etc.    │    │  oee-geral, etc.        │   │
│  └──────────────┘    └──────────────────┘    └─────────────────────────┘   │
└─────────────────────────────────┬──────────────────────────────────────────┘
                                  │ HTTP/HTTPS
                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND - Node.js/Express                            │
│                     ┌─────────────────────────┐                             │
│                     │    Servidor Express     │                             │
│                     │   server.js (Port 3000) │                             │
│                     └───────────┬─────────────┘                             │
│                                 │                                           │
│  ┌──────────────────────────────┴───────────────────────────────────────┐  │
│  │                           ROTAS API                                   │  │
│  │  /api/auth  │  /api/producao  │  /api/logistica  │  /api/produtos    │  │
│  │  /api/paradas-maquina  │  /api/configuracoes  │  /api/sensor-data    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  MIDDLEWARE: Auth (JWT Token)  │  CORS  │  Helmet Security         │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │ Serviço Externo │                                                        │
│  │   Nodemailer    │                                                        │
│  └─────────────────┘                                                        │
└─────────────────────────────────┬──────────────────────────────────────────┘
                                  │ Mongoose ODM
                                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           BANCO DE DADOS                                    │
│                     ┌─────────────────────────┐                             │
│                     │        MongoDB          │                             │
│                     │      sistema_oee        │                             │
│                     └───────────┬─────────────┘                             │
│                                 │                                           │
│  Collections: users, machines, produtos, turnos, ordens_producao, etc.     │
└────────────────────────────────────────────────────────────────────────────┘
```

### Infraestrutura IoT e Máquinas Industriais

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       INFRAESTRUTURA DE REDE                                 │
│                      ┌────────────────────┐                                  │
│                      │        VPN         │                                  │
│                      │  Conexão Segura    │                                  │
│                      └─────────┬──────────┘                                  │
│            ┌───────────────────┼───────────────────┐                         │
│            │                   │                   │                         │
│            ▼                   ▼                   ▼                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │   Máquina 1     │ │   Máquina 2     │ │   Máquina N     │                │
│  │  MachineId: M1  │ │  MachineId: M2  │ │  MachineId: MN  │                │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘                │
│           │                   │                   │                         │
│           ▼                   ▼                   ▼                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐                │
│  │   Sensor M1     │ │   Sensor M2     │ │   Sensor MN     │                │
│  │ RSSI,SNR,Latency│ │ RSSI,SNR,Latency│ │ RSSI,SNR,Latency│                │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘                │
│           │                   │                   │                         │
│           └───────────────────┴───────────────────┘                         │
│                               │                                              │
│                      Dados de Rede HTTP                                      │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    Sensor Routes      │
                    │   /api/sensor-data    │
                    └───────────────────────┘
```

### Fluxo de Dados

1. **Máquinas Industriais** → Sensores coletam RSSI, SNR e Latência
2. **VPN** → Conexão segura entre máquinas e servidor
3. **Sensor Routes** → Recebe dados via HTTP em `/api/sensor-data`
4. **Express API** → Processa e valida os dados recebidos
5. **MongoDB** → Persiste dados históricos e em tempo real
6. **Dashboard Web** → Visualização dos indicadores OEE
7. **Node-RED** → Simulação de ciclos de produção e eventos IoT

---

## 📊 Indicadores OEE

O sistema calcula automaticamente os três pilares do OEE:

| Indicador | Fórmula | Descrição |
|-----------|---------|-----------|
| **Disponibilidade** | Tempo Produzindo / Tempo Planejado | Mede o tempo que a máquina está disponível |
| **Performance** | Produção Real / Produção Teórica | Mede a velocidade de produção |
| **Qualidade** | Peças Boas / Total Produzido | Mede a taxa de produtos conformes |

**OEE = Disponibilidade × Performance × Qualidade**

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- MongoDB
- Node-RED
- Raspberry Pi (para simulação física)

### Passos

```bash
# Clone o repositório
git clone https://github.com/owMath/oee-monitoring-system.git

# Entre no diretório
cd oee-monitoring-system

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o MongoDB
mongod

# Inicie o servidor
npm start
```

---

## 📁 Estrutura do Projeto

```
OEE-Monitoring-System/
├── 📂 config/
│   └── 📄 database.js          # Configuração MongoDB
├── 📂 middleware/
│   └── 📄 auth.js              # Autenticação JWT
├── 📂 models/
│   ├── 📄 ConfiguracaoProduto.js
│   ├── 📄 Counter.js
│   ├── 📄 Descarte.js
│   ├── 📄 EmpresaConfig.js
│   ├── 📄 ItemLogistica.js
│   ├── 📄 LinhaProducao.js
│   ├── 📄 Machine.js
│   ├── 📄 MotivoDescarte.js
│   ├── 📄 MotivoParada.js
│   ├── 📄 OrdemProducao.js
│   ├── 📄 ParadaMaquina.js
│   ├── 📄 Produto.js
│   ├── 📄 Turno.js
│   ├── 📄 User.js
│   └── 📄 VinculoProdutoMaquina.js
├── 📂 public/
│   ├── 📂 css/                 # Estilos das páginas
│   ├── 📂 js/                  # Scripts do frontend
│   │   └── 📂 libs/            # Bibliotecas (Chart.js, jsPDF, html2canvas)
│   ├── 📂 imgs/                # Imagens e logos
│   ├── 📄 index.html           # Dashboard principal
│   ├── 📄 login.html           # Tela de login
│   ├── 📄 oee-geral.html       # Visão geral OEE
│   ├── 📄 visao-tempo-real.html
│   ├── 📄 maquinas.html        # Gestão de máquinas
│   ├── 📄 maquina-1..5.html    # Páginas individuais das máquinas
│   ├── 📄 logistica.html       # Módulo de logística
│   ├── 📄 relatorios.html      # Geração de relatórios
│   ├── 📄 paradas-maquina.html
│   ├── 📄 motivos-parada.html
│   ├── 📄 motivos-descarte.html
│   ├── 📄 lista-descartes.html
│   ├── 📄 cadastro-produtos.html
│   ├── 📄 configuracao-produtos.html
│   ├── 📄 produto-maquina.html
│   ├── 📄 configuracoes-turno.html
│   ├── 📄 configuracoes-sistema.html
│   ├── 📄 usuarios.html
│   ├── 📄 perfil.html
│   ├── 📄 mtbf.html            # Mean Time Between Failures
│   ├── 📄 mttr.html            # Mean Time To Repair
│   ├── 📄 previsao.html        # Previsões de produção
│   └── 📄 analise-producao.html
├── 📂 routes/
│   ├── 📄 auth.js              # Autenticação
│   ├── 📄 producao.js          # Dados de produção
│   ├── 📄 sensor-data.js       # Dados dos sensores IoT
│   ├── 📄 logistica.js         # Ordens e entregas
│   ├── 📄 ordens-producao.js
│   ├── 📄 paradas-maquina.js
│   ├── 📄 motivos-parada.js
│   ├── 📄 motivos-descarte.js
│   ├── 📄 descartes.js
│   ├── 📄 produtos.js
│   ├── 📄 configuracoes-produtos.js
│   ├── 📄 vinculos-produto-maquina.js
│   ├── 📄 turnos.js
│   └── 📄 configuracoes.js
├── 📂 utils/
│   └── 📄 emailSender.js       # Envio de emails
├── 📄 server.js                # Entrada da aplicação
├── 📄 flows.json               # Fluxos Node-RED
├── 📄 config.env               # Variáveis de ambiente
├── 📄 railway.json             # Config deploy Railway
├── 📄 package.json
└── 📄 package-lock.json
```

---

## 👨‍💻 Autores

<div align="center">

*Projeto desenvolvido em dupla como Trabalho de Conclusão de Curso — PUC-PR (2025)*

---

**Matheus Paul Lopuch**

🎓 Engenharia de Computação

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/owMath)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/matheuslopuch)

---

**Henrique Antonio de Andrade**

⚡ Engenharia Elétrica

</div>

