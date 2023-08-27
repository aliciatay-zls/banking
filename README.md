# Go Banking Web App
https://www.udemy.com/course/rest-based-microservices-api-development-in-go-lang/

## Startup
1. To start the db, first start the Docker app. Then in terminal, `cd` to `build/package` and run:
```
docker-compose up
```
2. To start the app, open another tab in terminal and run one of the following:
   * `./run.ps1` if using Powershell (e.g. Intellij terminal)
   * `./run.sh`

## Tasks
1. Start and run server, create routes: GET `greet`, GET `customers`
2. JSON or XML encoding of response for GET `customers` route, depending on request header
3. Replace standard library request multiplexer: `gorilla/mux`
4. Create routes: GET `customers/{id}`,  POST `customers`
5. Restructure code into hexagonal architecture (and into packages): add ability to find customers
   1. business domain objects `Customer`, `DefaultCustomerService`
   2. repo/secondary port `CustomerRepository`
   3. stub/adapter `CustomerRepositoryStub`
   4. service/primary port `CustomerService`
   5. REST handler/adapter `CustomerHandlers`
   6. DB/adapter `CustomerRepositoryDb`
6. Add ability to handle errors: `errs` package
7. Enhance route: GET `customers?status=...`
8. Replace standard library logger with structured leveled logging: `logger` package, `zap`
9. Replace standard library SQL database package: `sqlx`
10. Add DTO to separate data used within Domain-Server layers and data exposed to User layer
11. Use environment variables
12. Add ability to open bank account (domain object `Account`, repo `AccountRepository`, 
DB/adapter `AccountRepositoryDb`)

## Other Notes
* Files in `build/package` taken from instructor's repo
