# Go Banking Web App - Resource Server
https://www.udemy.com/course/rest-based-microservices-api-development-in-go-lang/

## Setup
1. Install Go
   * Uninstall previous Go (if any): https://go.dev/doc/manage-install under section “Uninstalling Go” 
   * Download installer for newest Go version and follow steps to install: https://go.dev/doc/install

2. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. Configure environment variables in `run.ps1` or `run.sh`, such as `DB_USER` and `DB_PASSWORD`

## Running the app
1. To start the db, first start the Docker app. Then in terminal, `cd` to `build/package` and run:
   ```
   docker-compose up
   ```

2. To start the app, open another tab in terminal and run one of the following:
   * `./run.ps1` if using Powershell (e.g. Intellij terminal)
   * `./run.sh`

   An info-level log with the message "Starting the app..." will be printed to console on success.
<br/><br/>
3. [Postman](https://www.postman.com/) can be used to send requests to the app. Sample requests:

| Method | URL                                                | Authorization Header (Bearer Token) | Body                                                    | Result                                                                                                                                                             |
|--------|----------------------------------------------------|-------------------------------------|---------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GET    | http://localhost:8080/customers                    | (token received after logging in)   |                                                         | Will display details of customers with id 2000 to 2005                                                                                                             |
| GET    | http://localhost:8080/customers/2000               | (token received after logging in)   |                                                         | Will display details of the customer with id 2000                                                                                                                  |
| POST   | http://localhost:8080/customers/2000/account       | (token received after logging in)   | {"account_type": "saving", <br/>"amount": 7000}         | Will open a new bank account containing $7000 for the customer with id 2000, then display the new bank account id                                                  |
| POST   | http://localhost:8080/customers/2000/account/95470 | (token received after logging in)   | {"transaction_type": "withdrawal", <br/>"amount": 1000} | Will make a withdrawal of $1000 for the customer with id 2000 for the account with id 95470, then display the updated account balance and completed transaction id |

4. To check changes made to the app database, open another tab in terminal and start an interactive shell in 
the container for querying the db:
   ```
   docker exec -it mysql sh
   # mysql -u root -p
   Enter password: (enter password "codecamp")
   mysql> show databases;
   mysql> use banking;
   mysql> show tables;
   mysql> select * from accounts;
   ```

## Tasks
1. Start and run server, create routes: GET `greet`, GET `customers`
2. JSON or XML encoding of response for GET `customers` route, depending on request header
3. Replace standard library request multiplexer: `gorilla/mux`
4. Create routes: GET `customers/{id}`,  POST `customers`
5. Restructure code into hexagonal architecture (and into packages): add ability to find customers
   1. business domain objects `Customer` and `DefaultCustomerService`
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
12. Add ability to open bank account (domain objects `Account` and `DefaultAccountService`, 
repo `AccountRepository`, DB/adapter `AccountRepositoryDb`, service `AccountService`, 
REST handler `AccountHandler`, DTOs `NewAccountRequest` and `NewAccountResponse`)
13. Add ability to make transaction in a bank account (domain object `Transaction`, 
DTOs `TransactionRequest` and `TransactionResponse`)
14. (Extra) Create Authentication Server using hexagonal architecture:
    1. Add ability to log in a client: generate a token for the client which acts as a session token 
    ([banking-auth repo]( https://github.com/udemy-go-1/banking-auth))
    2. Add ability to verify client's right to access route: require the token from i. for requests to all routes 
    (middleware `AuthMiddlewareHandler`), verify the token and role privileges of the client 
    ([banking-auth repo](https://github.com/udemy-go-1/banking-auth))

## Other Notes
* Files in `build/package` taken from instructor's repo
