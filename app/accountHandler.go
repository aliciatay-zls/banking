package app

import (
	"encoding/json"
	"github.com/aliciatay-zls/banking/dto"
	"github.com/aliciatay-zls/banking/service"
	"github.com/gorilla/mux"
	"net/http"
)

type AccountHandler struct {
	service service.AccountService //REST handler has dependency on service (service is a field)
}

func (h AccountHandler) newAccountHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	newAccountRequest := dto.NewAccountRequest{
		CustomerId: vars["customer_id"],
	}

	if err := json.NewDecoder(r.Body).Decode(&newAccountRequest); err != nil {
		writeJsonResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	response, err := h.service.CreateNewAccount(newAccountRequest)
	if err != nil {
		writeJsonResponse(w, err.Code, err.AsMessage())
		return
	}

	writeJsonResponse(w, http.StatusCreated, response)
}
