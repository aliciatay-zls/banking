package dto

import "github.com/aliciatay-zls/banking/errs"

type TransactionRequest struct {
	AccountId       string  `json:"account_id"`
	Amount          float64 `json:"amount"`
	TransactionType string  `json:"transaction_type"`
}

func (r TransactionRequest) Validate() *errs.AppError {
	if r.Amount < 0 {
		return errs.NewValidationError("Transaction amount cannot be negative")
	}
	if r.TransactionType != "withdrawal" && r.TransactionType != "deposit" { // (*)
		return errs.NewValidationError("Transaction type should be withdrawal or deposit")
	}
	return nil
}

// (*)
//Chose not to use strings.ToLower() here unlike in the lecture, because will have to ensure case-insensitivity
//throughout entire app (e.g. need to use it in transactionRepositoryDb.go as well), otherwise can have errors +
//records in database can get messed up due to uppercase/lowercase variations of "withdrawal" and "deposit" allowed in.
//Becomes more of job of input sanitization at the very start (e.g. handler?) before passing down these json values
//to the rest of the app.
