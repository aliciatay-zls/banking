package domain

//Server

import (
	"database/sql"
	"github.com/aliciatay-zls/banking/errs"
	"github.com/aliciatay-zls/banking/logger"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"time"
)

type CustomerRepositoryDb struct { //DB (adapter)
	client *sqlx.DB
}

// NewCustomerRepositoryDb connects to the database/gets a database handle, initializes a new DB adapter with the
// handle and returns DB.
func NewCustomerRepositoryDb() CustomerRepositoryDb { //helper function
	db, err := sqlx.Open("mysql", "root:codecamp@tcp(localhost:3306)/banking") //from docker yml file and sql script
	if err != nil {
		panic(err)
	}
	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	return CustomerRepositoryDb{db}
}

// FindAll queries the database and reads results into return object.
func (d CustomerRepositoryDb) FindAll(status string) ([]Customer, *errs.AppError) { //DB implements repo
	var err error
	customers := make([]Customer, 0)

	if status == "" {
		findAllSql := "SELECT customer_id, name, city, zipcode, date_of_birth, status FROM customers"
		err = d.client.Select(&customers, findAllSql)
	} else {
		findAllSql := "SELECT customer_id, name, city, zipcode, date_of_birth, status FROM customers WHERE status = ?"
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

	findCustomerSql := "SELECT customer_id, name, city, zipcode, date_of_birth, status FROM customers WHERE customer_id = ?"
	err := d.client.Get(&c, findCustomerSql, id) // (**)
	if err != nil {
		logger.Error("Error while scanning customer: " + err.Error())
		if err == sql.ErrNoRows { // (*)
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
