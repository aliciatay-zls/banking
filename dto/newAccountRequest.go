package dto

import (
	"fmt"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
)

const AccountTypeSaving = "saving"
const AccountTypeChecking = "checking"
const NewAccountMinAmountAllowed float64 = 5000

type NewAccountRequest struct {
	CustomerId  string   `json:"customer_id"`
	AccountType *string  `json:"account_type"`
	Amount      *float64 `json:"amount"`
}

func (r NewAccountRequest) Validate() *errs.AppError {
	if *r.Amount < NewAccountMinAmountAllowed {
		logger.Error("New account amount is invalid")
		return errs.NewValidationError(fmt.Sprintf("To open an account you must deposit at least %v", NewAccountMinAmountAllowed))
	}
	if *r.AccountType != AccountTypeSaving && *r.AccountType != AccountTypeChecking {
		logger.Error("New account type is invalid")
		return errs.NewValidationError(fmt.Sprintf("Account type should be %s or %s", AccountTypeSaving, AccountTypeChecking))
	}
	return nil
}
