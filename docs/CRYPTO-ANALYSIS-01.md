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

## Referência complementar: prompt visual sobre bots 24/7 (13/11/2026)
O conteúdo enviado pelo usuário propõe um agente de trading autônomo 24/7 com passos de especificação, prototipagem, teste, revisão e entrega. Seus pontos aproveitáveis na nossa implementação são: classificador de quatro regimes (tendência calma, lateral, agitado, crash); teste walk-forward fora da amostra; comparação obrigatória após custos com buy-and-hold; checagem pessimista e condições de desligamento; revisão noturna sem alterações autônomas de parâmetros.

### Adaptação deliberada
A versão do CryptoBridge NÃO executará bots 24/7 nem ordens reais; manter TRADING_DISABLED. Os controles de risco aplicam-se à elegibilidade de estudos e simulações. Qualquer futura execução requer SPEC separada, autorização explícita, identidade, custódia, logs e gates de segurança.
Um kill switch de "zerar todas as posições" pressupõe execução financeira e foi explicitamente descartado para esta fase. O mecanismo aplicável é **parar simulações e sinalizar indisponibilidade**.
O uso de Kelly fracionado e do limite ilustrativo de drawdown de 15% não está aprovado: não criar defaults por inferência do conteúdo visual.

### Backlog complementar
AN-08: regime por séries históricas e testes por janelas; AN-09: walk-forward e testes adversariais de custo, liquidez, latência, vieses e mudança de regime; AN-10: bloqueio fail-closed por dado envelhecido, erro de API e limite configurado pelo usuário; AN-11: revisão periódica de hipóteses e mudanças apenas sob aprovação.
Critérios de aceite exigem cálculos reproduzíveis com séries e logs de fonte; esses novos motores não estão implementados neste commit.
