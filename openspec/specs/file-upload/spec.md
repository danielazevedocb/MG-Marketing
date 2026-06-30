# file-upload Specification

## Purpose
TBD - created by archiving change file-storage. Update Purpose after archive.
## Requirements
### Requirement: Upload por Drag & Drop com validação
O sistema SHALL oferecer upload via Drag & Drop, validando tipo e tamanho do arquivo no
servidor antes de persistir, e registrando um `FileAsset` (URL pública + metadados).

#### Scenario: Upload de imagem válida
- **WHEN** o usuário arrasta uma imagem dentro dos limites permitidos
- **THEN** o arquivo é enviado, um `FileAsset` é criado e a URL pública fica disponível na UI

#### Scenario: Arquivo inválido é rejeitado
- **WHEN** o usuário tenta enviar um arquivo de tipo não permitido ou acima do limite
- **THEN** o upload é rejeitado com mensagem clara e nada é persistido

### Requirement: Otimização de imagens
O sistema SHALL otimizar imagens (compressão/dimensionamento) para reduzir peso preservando
qualidade adequada à exibição.

#### Scenario: Imagem grande é otimizada
- **WHEN** uma imagem acima do tamanho ideal é enviada
- **THEN** ela é otimizada antes/depois do armazenamento e a URL serve a versão otimizada

### Requirement: Banco guarda apenas URL e metadados
O sistema SHALL persistir somente URL pública e metadados do arquivo no banco, nunca o binário.

#### Scenario: Persistência de metadados
- **WHEN** um arquivo é enviado com sucesso
- **THEN** o `FileAsset` contém url, tipo, tamanho e demais metadados, sem o conteúdo binário

