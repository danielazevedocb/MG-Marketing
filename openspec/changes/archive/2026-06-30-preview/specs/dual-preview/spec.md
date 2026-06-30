## ADDED Requirements

### Requirement: Pré-visualização dual WhatsApp e Email
O sistema SHALL exibir simultaneamente uma pré-visualização de WhatsApp (à esquerda) e de Email
(à direita) a partir do conteúdo atual da campanha.

#### Scenario: Renderização inicial
- **WHEN** a etapa de preview é aberta com conteúdo preenchido
- **THEN** o painel mostra a versão WhatsApp e a versão Email do mesmo conteúdo

### Requirement: Atualização em tempo real
O sistema SHALL atualizar ambos os previews em tempo real conforme o usuário edita o conteúdo.

#### Scenario: Edição reflete imediatamente
- **WHEN** o usuário altera o título ou o texto
- **THEN** os dois previews refletem a alteração sem recarregar a página

### Requirement: Fidelidade por canal
O sistema SHALL renderizar o WhatsApp como mensagem de texto formatada (emojis, quebras,
destaques, links) e o Email como HTML moderno (banner, logo, título, texto, botão, rodapé).

#### Scenario: Formatação específica por canal
- **WHEN** o conteúdo contém destaques e quebras de linha
- **THEN** o preview WhatsApp mostra a formatação textual e o preview Email mostra o layout HTML correspondente
