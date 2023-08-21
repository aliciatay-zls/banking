package app

import (
	"github.com/aliciatay-zls/banking/domain"
	"github.com/aliciatay-zls/banking/service"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

func Start() {
	router := mux.NewRouter()

	//wiring = create REST handler
	//a. create actual repo using the DB/adapter (initializes a repo with data queried from db)
	//b. create service by passing in the repo (initialize its repo field with the actual repo)
	//c. create instance of REST handler by passing in the service (initializes its service field)
	ch := CustomerHandlers{service.NewCustomerService(domain.NewCustomerRepositoryDb())}

	//using the custom multiplexer, register route (pattern (url) --> handler method (writes response))
	//gorilla mux: paths can have variables
	router.HandleFunc("/customers", ch.customersHandler).Methods(http.MethodGet)

	//start and run server
	//listen on localhost and pass mux (custom multiplexer/handler) to Serve()
	err := http.ListenAndServe("localhost:8080", router)
	if err != nil {
		log.Fatal(err)
	}
}
