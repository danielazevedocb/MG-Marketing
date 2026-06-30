# r2-integration Specification

## Purpose
TBD - created by archiving change file-storage. Update Purpose after archive.
## Requirements
### Requirement: Serviço de objetos no Cloudflare R2
O sistema SHALL prover um serviço de servidor para enviar e remover objetos no Cloudflare R2,
usando credenciais apenas no servidor (nunca expostas ao cliente).

#### Scenario: Upload bem-sucedido retorna URL pública
- **WHEN** um arquivo válido é enviado pelo serviço
- **THEN** o objeto é gravado no R2 e o serviço retorna a URL pública correspondente

#### Scenario: Credenciais não vazam ao cliente
- **WHEN** o código do cliente é inspecionado
- **THEN** nenhuma credencial do R2 está presente (somente URLs públicas)

### Requirement: Remoção de objeto
O sistema SHALL permitir remover um objeto do R2 a partir de sua chave/URL registrada.

#### Scenario: Remoção de arquivo
- **WHEN** um `FileAsset` é excluído
- **THEN** o objeto correspondente é removido do R2 (ou marcado para remoção) de forma consistente

