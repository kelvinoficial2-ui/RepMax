# Foco

Aplicativo pessoal de musculação, pensado para instalação na tela inicial do iPhone. Permite acompanhar o treino do dia, marcar exercícios, visualizar consistência e salvar sessões no Firebase.

## Rodar localmente

Requer Node.js 22.13 ou mais recente.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Configurar o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Adicione um aplicativo Web ao projeto.
3. Ative o **Cloud Firestore**.
4. Em **Authentication > Sign-in method**, ative o provedor **Google** e escolha um e-mail de suporte.
5. Copie `.env.example` para `.env.local` e preencha os valores fornecidos pelo Firebase.
6. Publique as regras de `firestore.rules` pelo console ou pela Firebase CLI.

Sem essas variáveis o aplicativo abre em modo de demonstração e não grava dados.

## Instalar no iPhone

Depois de hospedar o aplicativo em um endereço HTTPS, abra-o no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**.

## Segurança

As chaves públicas do Firebase podem ficar no cliente. A proteção dos dados é feita pelo Firebase Authentication e pelas regras do Firestore. O arquivo `.env.local` não é versionado.

## Comandos

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — compilação de produção
- `npm run lint` — verificação de código
- `npm run format` — formatação
