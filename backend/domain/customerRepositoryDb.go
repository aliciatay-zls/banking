package domain

import (
	"database/sql"
	"errors"
	"github.com/jmoiron/sqlx"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
)

//Server

type CustomerRepositoryDb struct { //DB (adapter)
	client *sqlx.DB
}

// NewCustomerRepositoryDb initializes a new DB adapter with the given database handle and returns DB.
func NewCustomerRepositoryDb(dbClient *sqlx.DB) CustomerRepositoryDb { //helper function
	return CustomerRepositoryDb{dbClient}
}

// FindAll retrieves from database all customers with the given status.
func (d CustomerRepositoryDb) FindAll(status string) ([]Customer, *errs.AppError) { //DB implements repo
	var err error
	customers := make([]Customer, 0)

	if status == "" {
		findAllSql := "SELECT customer_id, name, date_of_birth, email, city, zipcode, status FROM customers"
		err = d.client.Select(&customers, findAllSql)
	} else {
		findAllSql := "SELECT customer_id, name, date_of_birth, email, city, zipcode, status FROM customers WHERE status = ?"
		err = d.client.Select(&customers, findAllSql, status)
	}
	if err != nil {
		logger.Error("Error while querying/scanning customer table: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	return customers, nil
}

func (d CustomerRepositoryDb) FindById(id string) (*Customer, *errs.AppError) {
	var c Customer

	findCustomerSql := "SELECT customer_id, name, date_of_birth, email, city, zipcode, status FROM customers WHERE customer_id = ?"
	err := d.client.Get(&c, findCustomerSql, id) // (**)
	if err != nil {
		logger.Error("Error while querying/scanning customer: " + err.Error())
		if errors.Is(err, sql.ErrNoRows) { // (*)
			return nil, errs.NewNotFoundError("Customer not found")
		} else {
			return nil, errs.NewUnexpectedError("Unexpected database error")
		}
	}

	return &c, nil
}

// (*)
//diff error types and hence the diff error message and status code pairs will be reflected later in the REST handler
//(will read the fields of the custom app error received from calling this method)

// (**)
//docs: Get will return sql.ErrNoRows like row.Scan would. An error is returned if the result set is empty.
