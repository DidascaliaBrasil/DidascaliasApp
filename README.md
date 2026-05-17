# Didascalias App (Vue + Electron + Firebase)

## Como usar os novos comandos no CMD
Agora as tarefas do seu dia a dia ficam totalmente separadas e organizadas por comandos específicos. Abra o terminal na raiz do projeto e execute as opções abaixo conforme a sua necessidade:

## Para testar e programar focado na Web (Navegador):
Inicia o servidor de desenvolvimento e você pode acessar o projeto pelo localhost no seu navegador.

```sh
npm run dev:web
```

## Para testar e programar focado no Desktop (Janela Electron):
Inicia o servidor e automaticamente abre a janela do aplicativo como um programa nativo do seu computador.

```sh
npm run dev:electron
```

## Para publicar a versão final no GitHub Pages:
Primeiro você gera os arquivos de produção otimizados para a web e depois faz o upload automático para o seu repositório no GitHub.

```sh
npm run build:web
npm run deploy
```

## Para gerar o instalador .exe do seu programa:
Esse comando vai compilar o código do Vue e em seguida o electron-builder criará uma pasta chamada release na raiz do seu projeto. Dentro dela estará o seu arquivo executável (o setup de instalação) pronto:

```sh
npm run build:electron
```
