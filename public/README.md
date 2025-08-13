# Arquivos Públicos

Esta pasta contém os recursos estáticos da aplicação Dashboard de Suporte.

## Arquivos Incluídos

### Arquivos de Texto/SVG (já no repositório)
- `robots.txt` - Configurações para crawlers de mecanismos de busca
- `placeholder.svg` - Imagem placeholder em formato SVG

### Arquivos Binários (não incluídos no repositório)
Os seguintes arquivos binários precisam ser adicionados manualmente:

- `favicon.ico` - Ícone do site exibido na aba do navegador
- `logo.png` - Logo da aplicação
- `notification.mp3` - Arquivo de áudio para notificações sonoras

## Instruções

Para uma instalação completa, certifique-se de adicionar os arquivos binários mencionados acima na pasta `public/` do projeto.

### Favicon
O arquivo `favicon.ico` deve ser um ícone de 16x16 ou 32x32 pixels.

### Logo
O arquivo `logo.png` deve conter o logotipo da empresa/aplicação.

### Notificação Sonora
O arquivo `notification.mp3` é usado pelo hook `useNotificationSound` para reproduzir alertas sonoros quando novos atendimentos são criados.