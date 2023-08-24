package app

import (
	"encoding/json"
	"github.com/aliciatay-zls/banking/service"
	"github.com/gorilla/mux"
	"net/http"
)

type CustomerHandlers struct {
	customerService service.CustomerService //REST handler has dependency on service (service is a field)
}

func (c CustomerHandlers) customersHandler(w http.ResponseWriter, r *http.Request) {
	customers, err := c.customerService.GetAllCustomers()
	if err != nil {
		writeJsonResponse(w, err.Code, err.AsMessage())
	} else {
		writeJsonResponse(w, http.StatusOK, customers)
	}
}

func (c CustomerHandlers) customerIdHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	customer, err := c.customerService.GetCustomer(vars["customer_id"])
	if err != nil {
		writeJsonResponse(w, err.Code, err.AsMessage()) // (*)
	} else {
		writeJsonResponse(w, http.StatusOK, customer)
	}
}

func writeJsonResponse(w http.ResponseWriter, code int, data interface{}) {
	w.Header().Add("Content-Type", "application/json") // (**)
	w.WriteHeader(code)
	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		panic(err)
	}
}

// (*)
//json.NewEncoder(w).Encode(err) causes status code to be included in json response
//	unnecessary, already in http status code
//	if do Encode(err.Message), will not produce json //not a struct!

// (**)
//modify response header (otherwise response will still be in application/text form even though encode in json)
//return Header object of the ResponseWriter w, add to it this key-value pair

//NOTE:
//using value receiver for all methods in this src file instead of pointer receiver
//difference:
// - https://go.dev/tour/methods/8
// - https://stackoverflow.com/questions/27775376/value-receiver-vs-pointer-receiver
