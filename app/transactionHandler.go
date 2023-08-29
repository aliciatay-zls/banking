package app

import (
	"encoding/json"
	"github.com/aliciatay-zls/banking/dto"
	"github.com/aliciatay-zls/banking/service"
	"net/http"
)

type TransactionHandler struct {
	service service.TransactionService //REST handler has dependency on service (service is a field)
}

func (h TransactionHandler) transactHandler(w http.ResponseWriter, r *http.Request) {
	transactionRequest := dto.TransactionRequest{}

	if err := json.NewDecoder(r.Body).Decode(&transactionRequest); err != nil {
		writeJsonResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	response, err := h.service.MakeTransaction(transactionRequest)
	if err != nil {
		writeJsonResponse(w, err.Code, err.AsMessage())
		return
	}

	writeJsonResponse(w, http.StatusCreated, response)
}
