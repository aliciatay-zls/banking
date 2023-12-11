package dto

import (
	"fmt"
	"github.com/asaskevich/govalidator"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
)

const TransactionTypeWithdrawal = "withdrawal"
const TransactionTypeDeposit = "deposit"
const TransactionMinAmountAllowed float64 = 0
const TransactionMaxAmountAllowed float64 = 99999999.99

type TransactionRequest struct {
	AccountId       string  `json:"account_id" valid:"numeric"`
	Amount          float64 `json:"amount" valid:"float,optional"` //to allow 0 since SetFieldsRequiredByDefault() is used
	TransactionType string  `json:"transaction_type" valid:"alpha,in(withdrawal|deposit)"`
	CustomerId      string  `json:"customer_id" valid:"numeric"`
}

func (r TransactionRequest) Validate() *errs.AppError {
	errMsgByField := []struct {
		Name string
		Msg  string
	}{
		{"account_id", "Account ID must be present and a number"},
		{"amount", fmt.Sprintf("Transaction amount cannot be less than $%v", TransactionMinAmountAllowed)},
		{"transaction_type", fmt.Sprintf("Transaction type should be %s or %s", TransactionTypeWithdrawal, TransactionTypeDeposit)},
		{"customer_id", "Customer ID must be present and a number"},
	}

	isValid, err := govalidator.ValidateStruct(r)
	if err != nil || !isValid {
		logger.Error("Transaction request is invalid: " + err.Error())
		for _, v := range errMsgByField {
			dueToField := govalidator.ErrorByField(err, v.Name)
			if dueToField != "" {
				return errs.NewValidationError(v.Msg)
			}
		}
	}

	isAmountValid := govalidator.InRangeFloat64(r.Amount, TransactionMinAmountAllowed, TransactionMaxAmountAllowed)
	if !isAmountValid {
		return errs.NewValidationError(errMsgByField[1].Msg)
	}

	//fallback msg
	if err != nil || !isValid {
		logger.Error("Transaction amount is invalid")
		return errs.NewValidationError("The account ID, amount, transaction type or customer ID is invalid")
	}
	return nil
}
