package dto

import (
	"fmt"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/formValidator"
	"github.com/udemy-go-1/banking-lib/logger"
)

const TransactionTypeWithdrawal = "withdrawal"
const TransactionTypeDeposit = "deposit"
const TransactionMinAmountAllowed float64 = 0
const TransactionMaxAmountAllowed float64 = 10000

type TransactionRequest struct {
	AccountId       string  `json:"account_id" validate:"required,max=11,number"`
	Amount          float64 `json:"amount" validate:"number,gte=0,lte=10000"`
	TransactionType string  `json:"transaction_type" validate:"required,alpha,oneof=withdrawal deposit"`
	CustomerId      string  `json:"customer_id" validate:"required,max=11,number"`
}

func (r TransactionRequest) Validate() *errs.AppError {
	errMsg := map[string]string{
		"AccountId":       "Account ID must be present and a number.",
		"Amount":          fmt.Sprintf("Please check that the transaction amount is valid."),
		"TransactionType": fmt.Sprintf("Transaction type should be %s or %s.", TransactionTypeWithdrawal, TransactionTypeDeposit),
		"CustomerId":      "Customer ID must be present and a number.",
	}
	if errsArr := formValidator.Struct(r); errsArr != nil {
		logger.Error(fmt.Sprintf("Transaction request is invalid (%s) (%s)",
			errsArr[0].Error(), errsArr[0].ActualTag()))
		return errs.NewValidationError(errMsg[errsArr[0].Field()])
	}

	return nil
}
