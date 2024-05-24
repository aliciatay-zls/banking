package domain

import (
	"github.com/aliciatay-zls/banking-lib/clock"
	"github.com/aliciatay-zls/banking-lib/errs"
	"github.com/aliciatay-zls/banking/backend/dto"
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

func NewAccount(customerId string, accountType string, amount float64, c clock.Clock) Account {
	return Account{
		CustomerId:  customerId,
		OpeningDate: c.NowAsString(),
		AccountType: accountType,
		Amount:      amount,
		Status:      "1", //default for newly-created account
	}
}

func (a Account) ToDTO() *dto.AccountResponse {
	return &dto.AccountResponse{
		AccountId:   a.AccountId,
		OpeningDate: a.OpeningDate,
		AccountType: a.AccountType,
		Amount:      a.Amount,
	}
}

func (a Account) ToNewAccountResponseDTO() *dto.NewAccountResponse {
	return &dto.NewAccountResponse{AccountId: a.AccountId, OpeningDate: a.OpeningDate}
}

func (a Account) CanWithdraw(withdrawalAmount float64) bool {
	return a.Amount >= withdrawalAmount
}

//Server

//go:generate mockgen -destination=../mocks/domain/mock_accountRepository.go -package=domain github.com/aliciatay-zls/banking/backend/domain AccountRepository
type AccountRepository interface { //repo (secondary port)
	Save(Account) (*Account, *errs.AppError)
	FindAll(string) ([]Account, *errs.AppError)
	FindById(string) (*Account, *errs.AppError)
	Transact(Transaction) (*Transaction, *errs.AppError)
}
