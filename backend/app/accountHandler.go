package app

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/backend/dto"
	"github.com/udemy-go-1/banking/backend/service"
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
		logger.Error("Error while decoding json body of new account request: " + err.Error())
		writeJsonResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	if newAccountRequest.AccountType == nil || newAccountRequest.Amount == nil {
		logger.Error("Field(s) missing or null in request body")
		writeJsonResponse(w, http.StatusBadRequest,
			"Field(s) missing or null in request body: account_type, amount")
		return
	}

	response, err := h.service.CreateNewAccount(newAccountRequest)
	if err != nil {
		writeJsonResponse(w, err.Code, err.AsMessage())
		return
	}

	writeJsonResponse(w, http.StatusCreated, response)
}

func (h AccountHandler) transactionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	transactionRequest := dto.TransactionRequest{
		AccountId:  vars["account_id"],
		CustomerId: vars["customer_id"],
	}

	if err := json.NewDecoder(r.Body).Decode(&transactionRequest); err != nil { // (*)
		logger.Error("Error while decoding json body of transaction request: " + err.Error())
		writeJsonResponse(w, http.StatusBadRequest, err.Error())
		return
	}
	if transactionRequest.TransactionType == nil || transactionRequest.Amount == nil {
		logger.Error("Field(s) missing or null in request body")
		writeJsonResponse(w, http.StatusBadRequest,
			"Field(s) missing or null in request body: transaction_type, amount")
		return
	}

	response, err := h.service.MakeTransaction(transactionRequest)
	if err != nil {
		writeJsonResponse(w, err.Code, err.AsMessage())
		return
	}

	writeJsonResponse(w, http.StatusCreated, response)
}

// (*)
//json.Decoder.Decode uses json.Unmarshal internally
//json.Unmarshal docs: "By default, object keys which don't have a corresponding struct field are ignored
//(see Decoder.DisallowUnknownFields for an alternative)."
