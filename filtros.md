# Feature filtros — base para el dashboard

Fuente: `mock-data.json` (10 modelos).

## Valores reales para los filtros
- Búsqueda por nombre (10): Llama 3.3 70B, Qwen3 32B, DeepSeek-V3,
  DeepSeek-R1, Mistral Small 3.1, Gemma 3 27B, Phi-4, GLM-4.5,
  Kimi K2, GPT-OSS 120B
- Modalidad input: Text (8) / Text+Image (2: Mistral Small 3.1, Gemma 3 27B)
- Modalidad output: Text (10, sin variación → filtro informativo)
- TTFT rango: 190ms (Phi-4) — 890ms (DeepSeek-R1).
  Umbrales útiles: <300ms (5 modelos), 300–400ms (3), >400ms (2).

## Filtros propuestos
1. Texto libre por `name` (coincidencia parcial, insensible a mayúsculas).
2. Select modalidad input: Todos / Text / Text+Image.
3. Rango TTFT: slider min–max (190–890) o presets rápido/medio/lento.
4. Ordenación por columna: nombre, precio input/output, TTFT,
   tokens día/semana (asc/desc).
5. Combinables entre sí + contador “X de 10 modelos” + botón limpiar.

## Notas de implementación
- Filtrado en cliente sobre el array del `fetch`, sin recargar.
- Normalizar con `toLowerCase().includes()` para el nombre.
- Mantener selección de filtros al cambiar entre tabla y gráficas.
