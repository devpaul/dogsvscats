# Infrastructure

This section describes the infrastructure used by the different deployment methodologies

## server + memory

Runs a monolithic server with [Nestjs] and persists data in memory using [sqljs]

## server + file

Runs a monolithic server with [Nestjs] and persists data to a file using [sqljs]

-   The file is stored in `/var/lib/sqljs`
-   `/var/lib/sqljs` is a docker volume that will maintain data even the server container is rebuilt

## server + db (WIP)

Runs a monolithic server with [Nestjs] and persists data to a mysql database

-   docker compose creates a server container and a database container using [Mariadb]

## server + external db (WIP)

Runs a monolithic server with [Nestjs] and persists data to an external mysql database

-   .env needs to be updated with credentials for your external database

## server + db (WIP)

Runs a serverless system using [serverless] and [Nestjs] and persists data to a mysql database
