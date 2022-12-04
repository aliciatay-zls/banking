package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

/*
1. Create a "greet" route that sends back "Hello world!" as response, start and run server
2. JSON encoding of response for "customers" route
*/

type Customer struct {
	Name    string `json:"name"`
	City    string `json:"city"`
	Zipcode string `json:"zipCode"`
}

func main() {
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

//sends back "Hello world!" as response
func greetHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello world!")
}

//returns a json response
func customersHandler(w http.ResponseWriter, r *http.Request) {
	customers := []Customer{
		{"Dorothy", "Emerald City", "12345"},
		{"Luke", "Tatooine", "67890"},
	}

	//modify response header (otherwise response will still be in application/text form even though encode in json)
	//return Header object of the ResponseWriter w, add to it this key-value pair
	w.Header().Add("Content-Type", "application/json")

	json.NewEncoder(w).Encode(customers)
}
