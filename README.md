# Go Banking Web App - Database, Backend Resource and Frontend Servers
https://www.udemy.com/course/rest-based-microservices-api-development-in-go-lang/

## Setup
1. Install Go
   * Uninstall previous Go (if any): https://go.dev/doc/manage-install under section “Uninstalling Go” 
   * Download installer for newest Go version and follow steps to install: https://go.dev/doc/install

2. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. Configure environment variables.
   * Development: in `run.ps1` or `run.sh` if not using the dummy values
   * Production: create a `.env` file with the same keys at the root of the project directory

4. Install or upgrade current version of Node.js and npm using the [Node.js installer](https://nodejs.org/en/download)

## Running the app (Development)
1. Change the `isModeProd` flag in `backend/main.go` to `false` to enter development mode.

2. Start the Docker app.

3. To start the database, backend resource and frontend servers:
   ```
   cd backend
   make -j3 dev
   ```
   In separate terminal, view logs for all three in real-time without them interleaving:
   ```
    tail -f backend/db.log backend/backend.log frontend/frontend.log
   ```
   On success, logs printed:
   * Database: will end with "ready for connections."
   * Backend resource server: will be an info-level log with the message "Starting the app..."
   * Frontend server: will end with "Ready in xx.xx s"
<br/>

4. To start the backend authentication server, see other repo: https://github.com/udemy-go-1/banking-auth

5. Navigate to https://localhost:3000/login to view the app.

6. Alternatively, [Postman](https://www.postman.com/) can be used to send requests to the backend APIs. Sample requests:

    | Method | Backend API Endpoint                                | Authorization Header (Bearer Token)      | Body                                                    | Result                                                                                                                                                             |
    |--------|-----------------------------------------------------|------------------------------------------|---------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | GET    | https://localhost:8080/customers                    | (access token received after logging in) |                                                         | Will display details of customers with id 2000 to 2005                                                                                                             |
    | GET    | https://localhost:8080/customers/2000               | (access token received after logging in) |                                                         | Will display details of the customer with id 2000                                                                                                                  |
    | GET    | https://localhost:8080/customers/2000/account       | (access token received after logging in) |                                                         | Will display details of bank accounts belonging to customer with id 2000                                                                                           |
    | POST   | https://localhost:8080/customers/2000/account/new   | (access token received after logging in) | {"account_type": "saving", <br/>"amount": 7000}         | Will open a new bank account containing $7000 for the customer with id 2000, then display the new bank account id                                                  |
    | POST   | https://localhost:8080/customers/2000/account/95470 | (access token received after logging in) | {"transaction_type": "withdrawal", <br/>"amount": 1000} | Will make a withdrawal of $1000 for the customer with id 2000 for the account with id 95470, then display the updated account balance and completed transaction id |

7. To check changes made to the app database, open another tab in terminal and start an interactive shell in 
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

8. Run all unit tests each time changes have been made:
   ```
   cd backend
   go test -v ./...
   ```

## Udemy Course
Below is a list of the main tasks in the Udemy course. 
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
    ([banking-auth repo](https://github.com/udemy-go-1/banking-auth))
    2. Add ability to verify client's right to access route: require the token from i. for requests to all routes 
    (middleware `AuthMiddlewareHandler`), verify the token and role privileges of the client 
    ([banking-auth repo](https://github.com/udemy-go-1/banking-auth))
15. Add state-based tests for domain objects, DTOs
16. Test routes
17. Test services
18. (Extra) Test DB adapters, stub adapter
19. Generate refresh token ([banking-auth repo](https://github.com/udemy-go-1/banking-auth))

Other Notes:
* Files in `build/package` taken from instructor's repo


## Frontend
Key dependencies:
* react, react-dom, next
* [cookie](https://www.npmjs.com/package/cookie?activeTab=readme)
* [react-cookie](https://www.npmjs.com/package/react-cookie?activeTab=readme)
