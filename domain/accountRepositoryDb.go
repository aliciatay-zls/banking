package domain

import (
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
