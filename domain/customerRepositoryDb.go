package domain

//Server

import (
	"database/sql"
	"github.com/aliciatay-zls/banking/errs"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"time"
)

type CustomerRepositoryDb struct { //DB (adapter)
	client *sql.DB
}

func (d CustomerRepositoryDb) FindAll() ([]Customer, *errs.AppError) { //DB implements repo
	//query db
	findAllSql := "SELECT customer_id, name, city, zipcode, date_of_birth, status FROM customers"
	rows, err := d.client.Query(findAllSql)
	if rows == nil || err != nil {
		log.Println("Error while querying customer table: " + err.Error())
		return nil, errs.NewUnexpectedError("Unexpected database error")
	}

	//read results into return object
	customers := make([]Customer, 0)
	for rows.Next() {
		var c Customer
		err = rows.Scan(&c.Id, &c.Name, &c.City, &c.Zipcode, &c.DateOfBirth, &c.Status)
		if err != nil {
			log.Println("Error while scanning customers: " + err.Error())
			return nil, errs.NewUnexpectedError("Unexpected database error")
		}
		customers = append(customers, c)
	}

	return customers, nil
}

func (d CustomerRepositoryDb) FindById(id string) (*Customer, *errs.AppError) {
	findCustomerSql := "SELECT customer_id, name, city, zipcode, date_of_birth, status FROM customers WHERE customer_id = ?"
	row := d.client.QueryRow(findCustomerSql, id)

	var c Customer
	err := row.Scan(&c.Id, &c.Name, &c.City, &c.Zipcode, &c.DateOfBirth, &c.Status)
	if err != nil {
		log.Println("Error while scanning customer: " + err.Error())

		if err == sql.ErrNoRows { // (*)
			return nil, errs.NewNotFoundError("Customer not found")
		} else {
			return nil, errs.NewUnexpectedError("Unexpected database error")
		}
	}

	return &c, nil
}

func NewCustomerRepositoryDb() CustomerRepositoryDb { //helper function
	//connect to db/get db handle
	db, err := sql.Open("mysql", "root:codecamp@tcp(localhost:3306)/banking") //from docker yml file and sql script
	if err != nil {
		panic(err)
	}
	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	//initialize new DB object and return it
	return CustomerRepositoryDb{db}
}

// (*)
//different error types and hence different error message and status code pairs reflected in REST handler
//(will read the fields of the custom app error received from calling this method)
