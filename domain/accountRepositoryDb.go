package domain

import (
	"database/sql"
	"github.com/aliciatay-zls/banking/errs"
	"github.com/aliciatay-zls/banking/logger"
	"github.com/jmoiron/sqlx"
	"strconv"
)

//Server

type AccountRepositoryDb struct { //DB (adapter)
	client *sqlx.DB
}

func NewAccountRepositoryDb(dbClient *sqlx.DB) AccountRepositoryDb {
	return AccountRepositoryDb{dbClient}
}

// Save creates a new entry in the database for the given account, sets its ID using the database-generated ID
// and returns the account.
func (d AccountRepositoryDb) Save(account Account) (*Account, *errs.AppError) { //DB implements repo
	addAccountSql := "INSERT INTO accounts (customer_id, opening_date, account_type, amount, status) VALUES (?, ?, ?, ?, ?)"
	result, err := d.client.Exec(addAccountSql,
		account.CustomerId, account.OpeningDate, account.AccountType, account.Amount, account.Status)
	if err != nil {
		logger.Error("Error while creating new account: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	id, err := result.LastInsertId()
	if err != nil {
		logger.Error("Error while getting id of newly inserted account: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}
	account.AccountId = strconv.FormatInt(id, 10)

	return &account, nil
}

// Transact retrieves details of the account with the given id to check if the given transaction is allowed.
// If so, it updates the account balance, creates a new entry in the database for the transaction, sets its ID
// using the database-generated ID and returns the completed transaction.
func (d AccountRepositoryDb) Transact(transaction Transaction) (*Transaction, *errs.AppError) { //DB implements repo
	var account Account
	findAccountSql := "SELECT * FROM accounts WHERE account_id = ?"
	err := d.client.Get(&account, findAccountSql, transaction.AccountId)
	if err != nil {
		logger.Error("Error while retrieving account: " + err.Error())
		if err == sql.ErrNoRows {
			return nil, errs.NewNotFoundError("Account not found")
		} else {
			return nil, errs.NewUnexpectedError("Unexpected database error")
		}
	}

	var newAmount float64
	if transaction.TransactionType == "withdrawal" {
		if account.Amount < transaction.Amount {
			return nil, errs.NewForbiddenError("Account does not contain enough funds to withdraw given amount")
		}
		newAmount = account.Amount - transaction.Amount
	} else {
		newAmount = account.Amount + transaction.Amount
	}

	updateAccountSql := "UPDATE accounts SET amount = ? WHERE account_id = ?"
	_, err = d.client.Exec(updateAccountSql, newAmount, account.AccountId)
	if err != nil {
		logger.Error("Error while updating account: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	var result sql.Result
	addTransactionSql := "INSERT INTO transactions (account_id, amount, transaction_type, transaction_date) VALUES (?, ?, ?, ?)"
	result, err = d.client.Exec(addTransactionSql,
		transaction.AccountId, transaction.Amount, transaction.TransactionType, transaction.TransactionDate)
	if err != nil {
		logger.Error("Error while creating new transaction: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	var id int64
	id, err = result.LastInsertId()
	if err != nil {
		logger.Error("Error while getting id of newly inserted transaction: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	transaction.TransactionId = strconv.FormatInt(id, 10)
	transaction.Balance = newAmount

	return &transaction, nil
}
