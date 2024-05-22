package app

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	"github.com/udemy-go-1/banking-lib/clock"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/backend/domain"
	"github.com/udemy-go-1/banking/backend/service"
	"net/http"
	"os"
	"time"
)

func checkEnvVars() {
	val, ok := os.LookupEnv("APP_ENV")
	if !ok {
		logger.Fatal("Environment variable APP_ENV not defined")
	}

	if val == "production" {
		if err := godotenv.Load(".env"); err != nil {
			logger.Fatal("Error loading .env file (needed in production mode)")
		}
	}

	envVars := []string{
		"SERVER_ADDRESS",
		"SERVER_PORT",
		"AUTH_SERVER_ADDRESS",
		"AUTH_SERVER_PORT",
		"FRONTEND_SERVER_ADDRESS",
		"FRONTEND_SERVER_PORT",
		"DB_USER",
		"DB_PASSWORD",
		"DB_HOST",
		"DB_PORT",
		"DB_NAME",
	}
	for _, key := range envVars {
		if os.Getenv(key) == "" {
			logger.Fatal(fmt.Sprintf("Environment variable %s was not defined", key))
		}
	}
}

func Start() {
	checkEnvVars()

	router := mux.NewRouter()

	dbClient := getDbClient()
	clk := clock.RealClock{}
	customerRepositoryDb := domain.NewCustomerRepositoryDb(dbClient)
	accountRepositoryDb := domain.NewAccountRepositoryDb(dbClient)
	ch := CustomerHandlers{service.NewCustomerService(customerRepositoryDb)}
	ah := AccountHandler{service.NewAccountService(accountRepositoryDb, clk)}

	router.
		HandleFunc("/customers", ch.customersHandler).
		Methods(http.MethodGet, http.MethodOptions).
		Name("GetAllCustomers")
	router.
		HandleFunc("/customers/{customer_id:[0-9]+}", ch.customerIdHandler).
		Methods(http.MethodGet, http.MethodOptions).
		Name("GetCustomer")
	router.
		HandleFunc("/customers/{customer_id:[0-9]+}/account", ah.accountsHandler).
		Methods(http.MethodGet, http.MethodOptions).
		Name("GetAccountsForCustomer")
	router.
		HandleFunc("/customers/{customer_id:[0-9]+}/account/new", ah.newAccountHandler).
		Methods(http.MethodPost, http.MethodOptions).
		Name("NewAccount")
	router.
		HandleFunc("/customers/{customer_id:[0-9]+}/account/{account_id:[0-9]+}", ah.transactionHandler).
		Methods(http.MethodPost, http.MethodOptions).
		Name("NewTransaction")

	amw := AuthMiddleware{domain.NewDefaultAuthRepository()}
	router.Use(amw.AuthMiddlewareHandler)

	address := os.Getenv("SERVER_ADDRESS")
	port := os.Getenv("SERVER_PORT")

	if os.Getenv("APP_ENV") == "production" { //Render provides TLS certs, HTTP requests will be redirected to HTTPS
		err := http.ListenAndServe(fmt.Sprintf("%s:%s", address, port), router)
		if err != nil {
			logger.Fatal(err.Error())
		}
	} else {
		certFile := "certificates/localhost.pem"
		keyFile := "certificates/localhost-key.pem"
		err := http.ListenAndServeTLS(fmt.Sprintf("%s:%s", address, port), certFile, keyFile, router)
		if err != nil {
			logger.Fatal(err.Error())
		}
	}
}

func getDbClient() *sqlx.DB {
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dataSource := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", dbUser, dbPassword, dbHost, dbPort, dbName)
	db, err := sqlx.Open("mysql", dataSource)
	if err != nil {
		logger.Fatal("Error while opening connection to database: " + err.Error())
	}
	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	return db
}

//Notes
//once the app is started, check that environment variables required for the app to function have been set

//create custom multiplexer/handler using mux package

//wiring = create REST handler
//0. connect to the database/get a database handle
//1. create instance of DB/adapter (initialize adapter with database handle)
//2. create instance of service by passing in the adapter as the repo implementation
//(initialize service's repo field with adapter)
//3. create instance of REST handler by passing in the service (initialize handler's service field)

//using the custom multiplexer, register route (pattern (url) --> handler method (writes response))
//gorilla mux: paths can have variables + if given vars don't match regex, mux sends error, req doesn't reach app

//introduce middleware

//start and run server
//listen on localhost and pass multiplexer to Serve()
