# Relatorio: Implementando Padroes de Teste

## Capa

- Disciplina/Curso: Engenharia de Software
- Trabalho: Implementando Padroes de Teste (Test Patterns)
- Nome completo: Guilherme Rodrigues
- Matricula: 834422

## Padroes de criacao de dados

O `UserMother` concentra usuarios fixos e comuns aos testes. Ele oferece
`umUsuarioPadrao()` e `umUsuarioPremium()`, evitando repetir detalhes como id,
nome, e-mail e tipo em cada cenario.

O `CarrinhoBuilder` foi usado em vez de um `CarrinhoMother` porque o carrinho e
um objeto composto e possui varias combinacoes validas: usuario, itens e
carrinho vazio. Um Mother exigiria muitos metodos para cada combinacao. O
Builder permite configurar somente o que importa no teste, por meio de uma API
fluente, e deixa valores padrao para o restante.

### Antes e depois

Antes, um teste teria um setup manual e repetitivo:

```js
const user = new User(2, 'Maria Premium', 'premium@email.com', 'PREMIUM');
const item = new Item('Compra Premium', 200);
const carrinho = new Carrinho(user, [item]);
```

Depois, o mesmo cenario fica mais expressivo:

```js
const carrinho = new CarrinhoBuilder()
    .comUser(UserMother.umUsuarioPremium())
    .comItens([new Item('Compra Premium', 200)])
    .build();
```

O setup passa a comunicar a intencao do cenario. Quando a estrutura das
entidades mudar, a manutencao fica concentrada nos builders, reduzindo
duplicacao e Setup Obscuro.

## Stubs e Mocks

No teste de sucesso Premium, o `GatewayPagamento` e usado principalmente como
Stub: `cobrar()` retorna `{ success: true }` para controlar o fluxo do sistema
e permitir verificar o estado final. A chamada tambem e observada para
confirmar o valor de R$ 180,00, mas seu papel principal e fornecer uma resposta
pre-definida.

O `EmailService` e um Mock porque o objetivo principal e verificar o
comportamento: ele deve ser chamado uma vez, com o e-mail, assunto e corpo
corretos. O teste usa `toHaveBeenCalledTimes` e `toHaveBeenCalledWith` para
validar essa interacao.

No cenario de falha, o gateway retorna `{ success: false }`. O teste verifica o
estado `null` e tambem garante que Repository e EmailService nao sejam usados.

## Conclusao

Builders e Object Mothers tornam a criacao de dados explicita e reutilizavel.
Stubs controlam respostas de dependencias, enquanto Mocks verificam efeitos e
interacoes. O uso deliberado desses padroes reduz Test Smells, evita
dependencias externas reais e produz uma suite mais legivel, isolada e
sustentavel.