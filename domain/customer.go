package domain

import "github.com/aliciatay-zls/banking/errs"

//Business Domain

type Customer struct { //business/domain object
	Id          string `json:"id" db:"customer_id"`
	Name        string `json:"name"`
	City        string `json:"city"`
	Zipcode     string `json:"zipCode"`
	DateOfBirth string `json:"dateOfBirth" db:"date_of_birth"`
	Status      string `json:"status"`
}

//Server

type CustomerRepository interface { //repo (secondary port)
	FindAll(string) ([]Customer, *errs.AppError)
	FindById(string) (*Customer, *errs.AppError) //allows nil customer, useful for checking
}
