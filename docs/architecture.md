# CatsVsDogs architecture

## Frontend Architecture

-   Dojo
-   PWA

## Backend Architecture

Backend is made up of a controller gateway and services that are mix-and-matchable

### Controller Gateway

-   `backend/traditional` hosts the traditional server
-   `backend/netlify` uses serverless architecture through Netlify functions
-   `backend/aws-lambda` uses AWS lambda functions

### Services

-   `services/memory` store results in program memory
-   `services/mysql` hosts the traditional server backend
-   `services/faunadb` uses faunadb services
-   `services/dynamodb` uses AWS Dynamodb
