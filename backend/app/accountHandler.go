package app

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/backend/dto"
	"github.com/udemy-go-1/banking/backend/service"
	"net/http"
)

type AccountHandler struct {
	service service.AccountService //REST handler has dependency on service (service is a field)
}

func (h AccountHandler) accountsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	response, appErr := h.service.GetAllAccounts(vars["customer_id"])
	if appErr != nil {
		writeJsonResponse(w, appErr.Code, appErr.AsMessage())
		return
	}

	writeJsonResponse(w, http.StatusOK, response)
}

func (h AccountHandler) newAccountHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	newAccountRequest := dto.NewAccountRequest{
		CustomerId: vars["customer_id"],
	}

	if err := json.NewDecoder(r.Body).Decode(&newAccountRequest); err != nil {
		logger.Error("Error while decoding json body of new account request: " + err.Error())
		writeJsonResponse(w, http.StatusBadRequest, errs.NewMessageObject("Please check that all fields are correctly filled."))
		return
	}

	if appErr := newAccountRequest.Validate(); appErr != nil {
		writeJsonResponse(w, appErr.Code, appErr.AsMessage())
		return
	}

	response, appErr := h.service.CreateNewAccount(newAccountRequest)
	if appErr != nil {
		writeJsonResponse(w, appErr.Code, appErr.AsMessage())
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
		writeJsonResponse(w, http.StatusBadRequest, errs.NewMessageObject("Please check that all fields are correctly filled."))
		return
	}

	if appErr := transactionRequest.Validate(); appErr != nil {
		writeJsonResponse(w, appErr.Code, appErr.AsMessage())
		return
	}

	response, appErr := h.service.MakeTransaction(transactionRequest)
	if appErr != nil {
		writeJsonResponse(w, appErr.Code, appErr.AsMessage())
		return
	}

	writeJsonResponse(w, http.StatusCreated, response)
}

// (*)
//json.Decoder.Decode uses json.Unmarshal internally
//json.Unmarshal docs: "By default, object keys which don't have a corresponding struct field are ignored
//(see Decoder.DisallowUnknownFields for an alternative)."
