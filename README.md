# 🏋️‍♂️ Ribeiro Team — Treinador Samuel Ribeiro

Landing page institucional e de alta conversão desenvolvida para o treinador **Samuel Ribeiro** e a sua equipe **"Ribeiro Team"** ([@treinador_samuelribeiro](https://www.instagram.com/treinador_samuelribeiro/)).

O projeto combina uma estética escura agressiva de elite esportiva com animações fluidas via **GSAP ScrollTrigger** e um módulo interativo 3D em **Three.js (WebGL)** com análise cinemática do Levantamento Terra (*Deadlift*).

---

## ⚡ Destaques & Funcionalidades

- **Hero Cinematográfico:** Vídeo de alta definição em loop com máscara gradiente escura (`#070707`), foto de destaque com iluminação de contorno (*red rim light*), métricas de autoridade (+500 vidas) e chamadas para ação duplas.
- **Módulo 3D Interativo (Three.js WebGL):**
  - Barra olímpica estilizada com anilhas de competição calibradas.
  - Atleta cinemático articulado com pontos anatômicos e zonas musculares ativas iluminadas em vermelho escarlate.
  - Transição interativa entre as 3 fases do Levantamento Terra:
    1. *Fase 1: Setup & Saída* (barra colada na tíbia, escápulas em depressão/adução, coluna neutra).
    2. *Fase 2: Tração* (leg drive, vetor vertical de força e recrutamento de cadeia posterior).
    3. *Fase 3: Lockout* (extensão completa de quadril e ativação máxima de glúteos).
  - Controle de visualização em 360° (*OrbitControls*), ângulos de câmera predefinidos (Sagital/Lateral, 3D e Frontal), scrubber deslizante e *toggle* de vetores de reação do solo.
  - Sincronização dinâmica via GSAP ScrollTrigger e economia de GPU (`IntersectionObserver`).
- **Design System Esportivo de Elite:**
  - Paleta: Preto Carbono (`#070707`), Preto Grafite (`#0F0F10`) e Vermelho Escarlate (`#E50914`).
  - Superfícies translúcidas com efeito *glassmorphism* (`backdrop-filter: blur(16px)` e bordas sutis).
  - Tipografia geométrica de impacto (`Syne`, `Bebas Neue` e `Plus Jakarta Sans`).
- **Ecossistema de Planos & Consultoria:**
  - *Consultoria Online Individualizada* (destaque com borda iluminada "Mais Procurado").
  - *Personal Training Presencial*.
  - *Preparação para Atletas & Físico Extremo*.
- **Galeria & Prova Social:** Grid com imagens dos bastidores de treino e link para o Instagram oficial.
- **FAQ Interativo:** *Accordion* com respostas diretas sobre início, lesões e equipamentos.
- **Conversão WhatsApp:** Botões estratégicos e botão flutuante com mensagens pré-configuradas para cada modalidade de atendimento.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico**
- **Tailwind CSS** (via CDN com extensão de tema personalizada)
- **Vanilla CSS** (`css/style.css` — Design System, glows, glassmorphism e scrollbar personalizada)
- **JavaScript Moderno (ES6+)**
- **Three.js (r128)** & **OrbitControls** — Renderização 3D WebGL
- **GSAP 3 & ScrollTrigger** — Animações baseadas em rolagem e timelines
- **Lucide Icons** — Ícones minimalistas
- **Google Fonts** (`Syne`, `Bebas Neue`, `Plus Jakarta Sans`)

---

## 📁 Estrutura de Arquivos

```text
Ribeiroteam/
├── Assets/
│   ├── eu/                       # Fotografias oficiais do Treinador Samuel Ribeiro
│   ├── modelos/                  # Mockups e referências visuais
│   └── video hero/               # Vídeo em alta resolução do Hero Frame
├── css/
│   └── style.css                 # Folha de estilos e variáveis do Design System
├── js/
│   ├── biomechanics3d.js         # Motor WebGL do Levantamento Terra em Three.js
│   └── main.js                   # Controlador de animações, vídeo, FAQ e interações
├── .gitignore                    # Arquivos ignorados pelo Git
├── index.html                    # Página principal da aplicação
├── README.md                     # Documentação oficial do projeto
└── vercel.json                   # Configuração de roteamento e deploy na Vercel
```

---

## 🚀 Como Executar Localmente

Como se trata de uma aplicação estática moderna de alto desempenho, não requer compilação prévia:

1. Clone o repositório:
   ```bash
   git clone https://github.com/Luiz-Gabriel-m/Ribeiroteam.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd Ribeiroteam
   ```
3. Abra diretamente o arquivo `index.html` em seu navegador favorito ou utilize uma extensão de servidor local (como *Live Server* do VS Code).

---

## ☁️ Deploy na Vercel

O projeto já conta com o arquivo `vercel.json` pré-configurado:

```json
{
  "cleanUrls": true,
  "trailingSlash": false
}
```

Para publicar:
1. Conecte sua conta da [Vercel](https://vercel.com/) ao GitHub.
2. Importe o repositório `Luiz-Gabriel-m/Ribeiroteam`.
3. Mantenha as configurações padrão (Framework Preset: *Other*) e clique em **Deploy**.

---

## 👤 Treinador Samuel Ribeiro

- **Instagram:** [@treinador_samuelribeiro](https://www.instagram.com/treinador_samuelribeiro/)
- **Metodologia:** Biomecânica Aplicada, Periodização Não-Linear e Alta Performance.

---

© 2026 Ribeiro Team. Todos os direitos reservados.
