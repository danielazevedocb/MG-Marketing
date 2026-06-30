## ADDED Requirements

### Requirement: Criptografia de credenciais
O sistema SHALL criptografar as credenciais dos provedores em repouso, usando uma chave mantida
apenas no servidor, e nunca expor as credenciais em texto puro à UI ou aos logs.

#### Scenario: Credenciais persistidas cifradas
- **WHEN** as credenciais de um provedor são salvas
- **THEN** o banco armazena o valor cifrado, não as credenciais em claro

#### Scenario: Uso no servidor
- **WHEN** o envio de email precisa das credenciais
- **THEN** elas são decriptadas apenas no servidor no momento do uso

#### Scenario: Não vazar em respostas
- **WHEN** a UI consulta a configuração do provedor
- **THEN** a resposta não inclui a senha/credenciais em claro (apenas indicação de preenchimento)
