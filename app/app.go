package app

import (
	"log"
	"net/http"
)

func Start() {
	//routes
	//register handler function (handles responses) for the pattern (url) in the DefaultServeMux (router)
	http.HandleFunc("/greet", greetHandler)
	http.HandleFunc("/customers", customersHandler)

	//start and run server
	//listen on localhost and pass DefaultServeMux (default handler) to Serve()
	err := http.ListenAndServe("localhost:8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
