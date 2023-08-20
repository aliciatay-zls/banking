package app

import (
	"encoding/json"
	"encoding/xml"
	"github.com/aliciatay-zls/banking/service"
	"net/http"
)

type CustomerHandlers struct {
	customerService service.CustomerService //REST handler has dependency on service (service is a field)
}

//sends a JSON (default) or XML response
func (c CustomerHandlers) customersHandler(w http.ResponseWriter, r *http.Request) {
	customers, _ := c.customerService.GetAllCustomers()

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
