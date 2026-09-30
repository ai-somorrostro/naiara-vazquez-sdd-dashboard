# Feature gráficas — base para el dashboard

Fuente: `mock-data.json` (10 modelos).
Campos por modelo: `name, inputPricePerToken, outputPricePerToken, ttft_ms,
inputModality, outputModality, inputTokensDay, outputTokensDay,
inputTokensWeek, outputTokensWeek`.

## Rangos reales (calculados del mock)
- Modelos (10): Llama 3.3 70B, Qwen3 32B, DeepSeek-V3, DeepSeek-R1,
  Mistral Small 3.1, Gemma 3 27B, Phi-4, GLM-4.5, Kimi K2, GPT-OSS 120B
- Precio input/token: min 0.00000007 (Phi-4) — max 0.00000055 (DeepSeek-R1)
- Precio output/token: min 0.00000014 (Phi-4) — max 0.00000219 (DeepSeek-R1)
- TTFT: min 190ms (Phi-4) — max 890ms (DeepSeek-R1)
- Total tokens día: input 30.980.000 / output 9.980.000
- Total tokens semana: input 215.200.000 / output 69.400.000
- Modalidades input: Text, Text+Image. Output: Text.

## Gráficas propuestas para el dashboard
1. Barras agrupadas: precio input vs output por modelo (eje Y log por el rango).
2. Barras horizontales apiladas: consumo día vs semana (input+output).
3. Dispersión: TTFT (ms) vs coste total estimado día
   (`inputTokensDay*inputPrice + outputTokensDay*outputPrice`).
4. Tarta o barras: reparto por modalidad input (Text vs Text+Image).
5. Tabla ordenable con filtro por nombre/modalidad (base para las gráficas).

## Notas de implementación
- Leer con `fetch('mock-data.json')`, sin dependencias.
- Formatear precios con notación científica o $/1M tokens.
- Colores por modelo fijos para coherencia entre gráficas.
