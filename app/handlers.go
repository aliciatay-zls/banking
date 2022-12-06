package app

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"net/http"
)

type Customer struct {
	Name    string `json:"name"`
	City    string `json:"city"`
	Zipcode string `json:"zipCode"`
}

func greetHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello world!")
}

//returns a JSON (default) or XML response
func customersHandler(w http.ResponseWriter, r *http.Request) {
	customers := []Customer{
		{"Dorothy", "Emerald City", "12345"},
		{"Luke", "Tatooine", "67890"},
	}

	if r.Header.Get("Content-Type") == "application/xml" {
		w.Header().Add("Content-Type", "application/xml")
		xml.NewEncoder(w).Encode(customers)
	} else {
		//modify response header (otherwise response will still be in application/text form even though encode in json)
		//return Header object of the ResponseWriter w, add to it this key-value pair
		w.Header().Add("Content-Type", "application/json")
		json.NewEncoder(w).Encode(customers)
	}
}
