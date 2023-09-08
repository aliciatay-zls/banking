package dto

import (
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
)

type NewAccountRequest struct {
	CustomerId  string   `json:"customer_id"`
	AccountType *string  `json:"account_type"`
	Amount      *float64 `json:"amount"`
}

func (r NewAccountRequest) Validate() *errs.AppError {
	if *r.Amount < 5000.00 {
		logger.Error("New account amount is invalid")
		return errs.NewValidationError("To open an account you must deposit at least 5000")
	}
	if *r.AccountType != "saving" && *r.AccountType != "checking" {
		logger.Error("New account type is invalid")
		return errs.NewValidationError("Account type should be saving or checking")
	}
	return nil
}
