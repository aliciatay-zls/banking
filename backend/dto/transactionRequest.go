package dto

import (
	"fmt"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
)

const TransactionTypeWithdrawal = "withdrawal"
const TransactionTypeDeposit = "deposit"
const TransactionMinAmountAllowed float64 = 0

type TransactionRequest struct { // (**)
	AccountId       string   `json:"account_id"`
	Amount          *float64 `json:"amount"`
	TransactionType *string  `json:"transaction_type"`
	CustomerId      string   `json:"customer_id"`
}

func (r TransactionRequest) Validate() *errs.AppError {
	if *r.Amount < TransactionMinAmountAllowed {
		logger.Error("Transaction amount is invalid")
		return errs.NewValidationError(fmt.Sprintf("Transaction amount cannot be less than %v", TransactionMinAmountAllowed))
	}
	if *r.TransactionType != TransactionTypeWithdrawal && *r.TransactionType != TransactionTypeDeposit { // (*)
		logger.Error("Transaction type is invalid")
		return errs.NewValidationError(fmt.Sprintf("Transaction type should be %s or %s", TransactionTypeWithdrawal, TransactionTypeDeposit))
	}
	return nil
}

// (*)
//Chose not to use strings.ToLower() here unlike in the lecture, because will have to ensure case-insensitivity
//throughout entire app (e.g. do for customers APIs --> need to use it in customerRepositoryDb.go as well),
//otherwise can have errors + records in database can get messed up due to uppercase/lowercase variations of
//"withdrawal" and "deposit" allowed in.
//Becomes more of job of input sanitization at the very start (e.g. handler?) before passing down these json values
//to the rest of the app.

// (**)
//Made some fields pointers (those that are filled from the POST request body) = allows nil, useful for checking.
//Handler will check if they were filled first before app does anything else.
//Fields that are filled from the route variables remain regular variables = impossible for route variables to be nil
//as mux would have ensured that to land on this route, the route variable was passed in and adheres to the regex expr.
//
//Same for NewAccountRequest.
