package domain

import (
	"database/sql"
	"errors"
	"github.com/aliciatay-zls/banking-lib/errs"
	"github.com/aliciatay-zls/banking-lib/logger"
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

// FindAll retrieves all accounts belonging to the customer with the given id.
func (d AccountRepositoryDb) FindAll(customerId string) ([]Account, *errs.AppError) {
	accounts := make([]Account, 0)
	selectSql := "SELECT * FROM accounts WHERE customer_id = ?"
	err := d.client.Select(&accounts, selectSql, customerId)
	if err != nil {
		logger.Error("Error while retrieving all accounts belonging to this customer: " + err.Error())
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.NewNotFoundError("No accounts found for this customer or customer does not exist")
		}
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	return accounts, nil
}

// FindById retrieves the account with the given id.
func (d AccountRepositoryDb) FindById(accountId string) (*Account, *errs.AppError) {
	var account Account
	findAccountSql := "SELECT * FROM accounts WHERE account_id = ?"
	err := d.client.Get(&account, findAccountSql, accountId)
	if err != nil {
		logger.Error("Error while retrieving account: " + err.Error())
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errs.NewNotFoundError("Account not found")
		} else {
			return nil, errs.NewUnexpectedError("Unexpected database error")
		}
	}

	return &account, nil
}

// Transact starts a database transaction, updates the account balance, creates a new entry in the database for
// the given bank transaction and commits the database transaction. It then fills the missing fields of the given
// bank transaction by retrieving the ID of the new entry as well as the new account balance.
// Transact returns the modified given bank transaction.
func (d AccountRepositoryDb) Transact(transaction Transaction) (*Transaction, *errs.AppError) { //DB implements repo
	tx, err := d.client.Begin()
	if err != nil {
		logger.Error("Error while starting db transaction for making transaction in bank account: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	var updateAccountSql string
	if transaction.IsWithdrawal() {
		updateAccountSql = "UPDATE accounts SET amount = amount - ? WHERE account_id = ?"
	} else {
		updateAccountSql = "UPDATE accounts SET amount = amount + ? WHERE account_id = ?"
	}
	_, err = tx.Exec(updateAccountSql, transaction.Amount, transaction.AccountId)
	if err != nil {
		logger.Error("Error while updating account: " + err.Error())
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			logger.Fatal("Error while rolling back updating of account: " + rollbackErr.Error())
		}
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	var result sql.Result
	addTransactionSql := "INSERT INTO transactions (account_id, amount, transaction_type, transaction_date) VALUES (?, ?, ?, ?)"
	result, err = tx.Exec(addTransactionSql,
		transaction.AccountId, transaction.Amount, transaction.TransactionType, transaction.TransactionDate)
	if err != nil {
		logger.Error("Error while creating new bank account transaction: " + err.Error())
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			logger.Fatal("Error while rolling back creating of new bank account transaction: " + rollbackErr.Error())
		}
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	if err = tx.Commit(); err != nil {
		logger.Error("Error while committing db transaction: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	id, err := result.LastInsertId()
	if err != nil {
		logger.Error("Error while getting id of newly inserted transaction: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}
	transaction.TransactionId = strconv.FormatInt(id, 10)

	account, appErr := d.FindById(transaction.AccountId)
	if appErr != nil {
		return nil, appErr
	}
	transaction.Balance = account.Amount

	return &transaction, nil
}
