package app

import (
	"log"
	"net/http"
)

func Start() {
	mux := http.NewServeMux()

	//routes
	//register handler function (handles responses) for the pattern (url) with the custom multiplexer (router)
	mux.HandleFunc("/greet", greetHandler)
	mux.HandleFunc("/customers", customersHandler)

	//start and run server
	//listen on localhost and pass mux (custom multiplexer/handler) to Serve()
	err := http.ListenAndServe("localhost:8080", mux)
	if err != nil {
		log.Fatal(err)
	}
}
