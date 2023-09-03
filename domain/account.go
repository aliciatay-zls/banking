package domain

import (
	"github.com/aliciatay-zls/banking/dto"
	"github.com/udemy-go-1/banking-lib/errs"
)

//Business Domain

type Account struct { //business/domain object
	AccountId   string  `db:"account_id"`
	CustomerId  string  `db:"customer_id"`
	OpeningDate string  `db:"opening_date"`
	AccountType string  `db:"account_type"`
	Amount      float64 `db:"amount"`
	Status      string  `db:"status"`
}

func (a Account) ToNewAccountResponseDTO() dto.NewAccountResponse {
	return dto.NewAccountResponse{AccountId: a.AccountId}
}

func (a Account) CanWithdraw(withdrawalAmount float64) bool {
	if a.Amount < withdrawalAmount {
		return false
	}
	return true
}

//Server

type AccountRepository interface { //repo (secondary port)
	Save(Account) (*Account, *errs.AppError)
	FindById(string) (*Account, *errs.AppError)
	Transact(Transaction) (*Transaction, *errs.AppError)
}
