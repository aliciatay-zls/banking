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

	//wiring
	//create stub of the repo, create default service passing in the stub repo, create instance of
	ch := CustomerHandlers{service.NewCustomerService(domain.NewCustomerRepositoryStub())}

	//routes
	//register handler function (handles responses) for the pattern (url) with the custom multiplexer (router)
	//gorilla mux: paths can have variables
	router.HandleFunc("/customers", ch.customersHandler).Methods(http.MethodGet)

	//start and run server
	//listen on localhost and pass mux (custom multiplexer/handler) to Serve()
	err := http.ListenAndServe("localhost:8080", router)
	if err != nil {
		log.Fatal(err)
	}
}
