# campaign-content Specification

## Purpose
TBD - created by archiving change campaigns. Update Purpose after archive.
## Requirements
### Requirement: Campos de conteúdo da campanha
O sistema SHALL suportar os campos titulo, subtitulo, texto, banner, imagem, link, botao,
preco, desconto, validade e observacoes, persistidos como `CampaignField`, com validação Zod.

#### Scenario: Preencher conteúdo
- **WHEN** o usuário preenche os campos de conteúdo com dados válidos
- **THEN** os campos são persistidos vinculados à campanha

#### Scenario: Campo numérico inválido
- **WHEN** o usuário informa um `preco`/`desconto` em formato inválido
- **THEN** a validação rejeita com mensagem clara

### Requirement: Tipo e mídia da campanha
O sistema SHALL associar um tipo (`CampaignType`) à campanha e permitir anexar banner/imagem via
file-storage.

#### Scenario: Anexar banner
- **WHEN** o usuário envia um banner pelo upload
- **THEN** a URL pública é vinculada ao campo banner da campanha

