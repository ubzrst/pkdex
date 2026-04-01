# pkdex
A mobile application that provides detailed Pokémon information and battle analysis.

The Battle Analyzer microservice integrates with the PokeAPI GraphQL endpoint to fetch true type-damage relations and base stats. It then uses LangChain and OpenAI to simulate objective, turn-by-turn battle sequences avoiding protagonist biases, all elegantly rendered onto an animated React Native timeline.

## Get started

1. Install dependencies

   ```bash
   bun install
   ```

2. Start the app

   ```bash
   bun expo start
   ```
   or
   ```
   bun expo start --tunnel
   ```
