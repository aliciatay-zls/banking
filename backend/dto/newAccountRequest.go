package dto

import (
	"fmt"
	"github.com/asaskevich/govalidator"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
)

const AccountTypeSaving = "saving"
const AccountTypeChecking = "checking"
const NewAccountMinAmountAllowed float64 = 5000
const NewAccountMaxAmountAllowed float64 = 99999999.99

type NewAccountRequest struct {
	CustomerId  string  `json:"customer_id" valid:"numeric"`
	AccountType string  `json:"account_type" valid:"alpha,in(saving|checking)"`
	Amount      float64 `json:"amount" valid:"float"`
}

func (r NewAccountRequest) Validate() *errs.AppError {
	//enables this method to return on the first invalid field encountered with a specific message
	//(govalidator custom error messages feature does not allow this, lumps all messages together)
	errMsgByField := []struct {
		Name string
		Msg  string
	}{
		{"customer_id", "Customer ID must be present and a number"},
		{"account_type", fmt.Sprintf("Account type should be %s or %s", AccountTypeSaving, AccountTypeChecking)},
		{"amount", fmt.Sprintf("To open an account you must deposit at least $%v", NewAccountMinAmountAllowed)},
	}

	isValid, err := govalidator.ValidateStruct(r)
	if err != nil || !isValid {
		logger.Error("New account request is invalid: " + err.Error())
		for _, v := range errMsgByField {
			if dueToField := govalidator.ErrorByField(err, v.Name); dueToField != "" { //replace govalidator auto-generated message
				return errs.NewValidationError(v.Msg) //with custom error message
			}
		}
	}

	isAmountValid := govalidator.InRangeFloat64(r.Amount, NewAccountMinAmountAllowed, NewAccountMaxAmountAllowed)
	if !isAmountValid {
		logger.Error("New account amount is invalid")
		return errs.NewValidationError(errMsgByField[2].Msg)
	}

	//fallback msg
	if err != nil || !isValid {
		return errs.NewValidationError("The customer ID, account type or initial amount is invalid")
	}
	return nil
}
