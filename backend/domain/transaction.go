package domain

import (
	"github.com/aliciatay-zls/banking-lib/clock"
	"github.com/aliciatay-zls/banking/backend/dto"
)

//Business Domain

type Transaction struct { //business/domain object
	TransactionId   string  `db:"transaction_id"`
	AccountId       string  `db:"account_id"`
	Amount          float64 `db:"amount"`
	Balance         float64
	TransactionType string `db:"transaction_type"`
	TransactionDate string `db:"transaction_date"`
}

func NewTransaction(accountId string, amount float64, transactionType string, c clock.Clock) Transaction {
	return Transaction{
		AccountId:       accountId,
		Amount:          amount,
		TransactionType: transactionType,
		TransactionDate: c.NowAsString(),
	}
}

func (t Transaction) ToTransactionResponseDTO() *dto.TransactionResponse {
	return &dto.TransactionResponse{
		TransactionId:   t.TransactionId,
		Balance:         t.Balance,
		TransactionDate: t.TransactionDate,
	}
}

func (t Transaction) IsWithdrawal() bool {
	return t.TransactionType == dto.TransactionTypeWithdrawal
}
