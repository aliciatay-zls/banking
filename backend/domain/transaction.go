package domain

import (
	"github.com/udemy-go-1/banking/backend/dto"
	"time"
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

func NewTransaction(accountId string, amount float64, transactionType string) Transaction {
	return Transaction{
		AccountId:       accountId,
		Amount:          amount,
		TransactionType: transactionType,
		TransactionDate: time.Now().Format("2006-01-02 15:04:05"),
	}
}

func (t Transaction) ToTransactionResponseDTO() *dto.TransactionResponse {
	return &dto.TransactionResponse{
		TransactionId: t.TransactionId,
		Balance:       t.Balance,
	}
}

func (t Transaction) IsWithdrawal() bool {
	return t.TransactionType == dto.TransactionTypeWithdrawal
}
