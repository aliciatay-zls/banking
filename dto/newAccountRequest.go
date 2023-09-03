package dto

import "github.com/udemy-go-1/banking-lib/errs"

type NewAccountRequest struct {
	CustomerId  string   `json:"customer_id"`
	AccountType *string  `json:"account_type"`
	Amount      *float64 `json:"amount"`
}

func (r NewAccountRequest) Validate() *errs.AppError {
	if *r.Amount < 5000.00 {
		return errs.NewValidationError("To open an account you must deposit at least 5000")
	}
	if *r.AccountType != "saving" && *r.AccountType != "checking" {
		return errs.NewValidationError("Account type should be saving or checking")
	}
	return nil
}
