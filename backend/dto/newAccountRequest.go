package dto

import (
	"fmt"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/formValidator"
	"github.com/udemy-go-1/banking-lib/logger"
)

const AccountTypeSaving = "saving"
const AccountTypeChecking = "checking"
const NewAccountMinAmountAllowed float64 = 5000
const NewAccountMaxAmountAllowed float64 = 99999999.99

type NewAccountRequest struct {
	CustomerId  string  `json:"customer_id" validate:"required,max=11,number"`
	AccountType string  `json:"account_type" validate:"required,alpha,oneof=saving checking"`
	Amount      float64 `json:"amount" validate:"required,number,gte=5000,lte=99999999.99"`
}

func (r NewAccountRequest) Validate() *errs.AppError {
	//enables this method to return on the first invalid field encountered with a specific message
	errMsg := map[string]string{
		"CustomerId":  "Customer ID must be present and a number.",
		"AccountType": fmt.Sprintf("Account type should be %s or %s.", AccountTypeSaving, AccountTypeChecking),
		"Amount":      "Please check that the initial amount is valid.",
	}
	if errsArr := formValidator.Struct(r); errsArr != nil {
		logger.Error(fmt.Sprintf("New account request is invalid (%s) (%s)",
			errsArr[0].Error(), errsArr[0].ActualTag()))
		return errs.NewValidationError(errMsg[errsArr[0].Field()])
	}

	return nil
}
