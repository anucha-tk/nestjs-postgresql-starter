# NESTJS POSTGRESQL STARTER

- [NESTJS POSTGRESQL STARTER](#nestjs-postgresql-starter)
  - [Tech stacks](#tech-stacks)
- [How Start](#how-start)
  - [ENV](#env)
  - [Run Docker(Recommend)](#run-dockerrecommend)
    - [.env](#env-1)
    - [seed database](#seed-database)
  - [Run server on local and postgres on docker and run (Best for Dev)](#run-server-on-local-and-postgres-on-docker-and-run-best-for-dev)
    - [.env](#env-2)
    - [seed database](#seed-database-1)
    - [start server](#start-server)
  - [Playground](#playground)
  - [testing](#testing)
    - [unit-test](#unit-test)
    - [e2e-test](#e2e-test)

## Tech stacks

- Nestjs
- Postgresql
- TypeOrm + Repository Pattern
- Docker
- unit-test(79.2% Statements)
- e2e-test(83.84% Statements)
- swagger
- authenticate
- authorization
- apikey
- multi-langues
- pagination
- error handle
- debugger
- file upload
- policy
- request
- response
- and more...

# How Start

## ENV

change your .env follow by .env.example

## Run Docker(Recommend)

### .env

make sure .env look like

```env
HTTP_HOST=0.0.0.0
DATABASE_HOST=postgres
```

```bash
make start-dev
```

### seed database

access your nestjs server on docker

```bash
yarn seed
```

## Run server on local and postgres on docker and run (Best for Dev)

### .env

make sure .env look like

```env
HTTP_HOST=localhost
DATABASE_HOST=localhost
```

### seed database

access your nestjs server on docker

```bash
yarn seed
```

### start server

```bash
yarn start
```

## Playground

> http://localhost:5000/api/hello

## testing

make sure your postgres-test db is run on docker if not run

```bash
make start-postgres-test
```

### unit-test

```bash
yarn test:unit
```

### e2e-test

```bash
yarn test:e2e
```
