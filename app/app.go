package app

import (
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

func Start() {
	router := mux.NewRouter()

	//routes
	//register handler function (handles responses) for the pattern (url) with the custom multiplexer (router)
	//gorilla mux: paths can have variables
	router.HandleFunc("/greet", greetHandler).Methods(http.MethodGet)
	router.HandleFunc("/customers", customersHandler).Methods(http.MethodGet)
	router.HandleFunc("/customers/{customer_id:[0-9]+}", customerIDHandler).Methods(http.MethodGet)

	router.HandleFunc("/customers", createCustomerHandler).Methods(http.MethodPost)

	//start and run server
	//listen on localhost and pass mux (custom multiplexer/handler) to Serve()
	err := http.ListenAndServe("localhost:8080", router)
	if err != nil {
		log.Fatal(err)
	}
}
