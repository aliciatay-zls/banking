package main

import (
	"fmt"
	"log"
	"net/http"
)

/*
1. Create a "greet" route that sends back "Hello world!" as response, start and run server
*/

func main() {
	//routes
	//register handler function (handles responses) for the pattern (url) in the DefaultServeMux (router)
	http.HandleFunc("/greet", greetHandler)

	//start and run server
	//listen on localhost and pass DefaultServeMux (default handler) to Serve()
	err := http.ListenAndServe("localhost:8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}

//sends back "Hello world!" as response
func greetHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello world!")
}
