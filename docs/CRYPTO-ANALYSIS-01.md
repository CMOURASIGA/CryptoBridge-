# CRYPTO-ANALYSIS-01 | Avaliação da mesa de seis agentes

## Fonte e abordagem
PDF do usuário, 10 páginas, "6 agentes do Claude Code numa mesa de estudo de trading" (12/11/2026). Não replicar literalmente recursos de Claude Code no ChatGPT: criar papéis lógicos com responsabilidades e evidências explícitas.

## O que adotar agora
- Scanner, pesquisador, otimista, pessimista, gestor de risco com veto e backtester sob demanda.
- Primeiro validar fonte/horário e contas matemáticas; depois construir argumentos.
- Risco definido pelo usuário, nunca pelo modelo; no caso de preços ausentes, vetar simulação dependente de mercado.
- Diário de hipóteses com decisões vetadas; backtest fora de amostra com custos.
- Defender contra prompt injection de notícias e nunca expor credenciais ou executar negociação real.

## O que NÃO importar sem validação
- Arquivos e comandos específicos do Claude Code; subagentes reais não foram implementados.
- Dados e planos gratuitos ou licenças citados no artigo sem verificar condições atuais, especialmente para eventual produto comercial.
- Limites 1%, 3%, 6% e RR 2:1 como política pessoal do usuário.
- Estatísticas publicitárias e exemplo de estratégia BOVA11 como evidência para BTC, ETH ou SOL.
- Tributação apresentada para day trade de bolsa como regime automaticamente aplicável à negociação de criptoativos.

## Plano incremental
AN-01 Skill e instruções (este commit); AN-02 serviço de dados OHLCV com origem e timestamps; AN-03 indicadores e cálculos determinísticos testados; AN-04 parâmetros de risco editáveis exclusivamente pelo usuário e veto aplicado em backend; AN-05 diário hipotético opt-in; AN-06 backtest fora da amostra e custos; AN-07 homologação real no ChatGPT.

## Gates
Continuam obrigatórios os testes de integração de cotação do Mercado Bitcoin (HV-03), a proibição de negociação real e autorização explícita para qualquer deploy em main. Não apresentar funcionalidades futuras como ativas.
