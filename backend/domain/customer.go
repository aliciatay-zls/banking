package domain

import (
	"github.com/aliciatay-zls/banking-lib/errs"
	"github.com/aliciatay-zls/banking/backend/dto"
)

//Business Domain

type Customer struct { //business/domain object
	Id          string `db:"customer_id"`
	Name        string
	DateOfBirth string `db:"date_of_birth"`
	Email       string
	Country     string
	Zipcode     string
	Status      string
}

// ToDTO does the conversion of domain object to Data Transfer Object.
func (c Customer) ToDTO() *dto.CustomerResponse {
	return &dto.CustomerResponse{
		Id:          c.Id,
		Name:        c.Name,
		DateOfBirth: c.DateOfBirth,
		Email:       c.Email,
		Country:     c.Country,
		Zipcode:     c.Zipcode,
		Status:      c.AsStatusName(),
	}
}

// AsStatusName gets the string representation of database values for customer status.
func (c Customer) AsStatusName() string {
	statusName := "active"
	if c.Status == "0" {
		statusName = "inactive"
	}

	return statusName
}

//Server

//go:generate mockgen -destination=../mocks/domain/mock_customerRepository.go -package=domain github.com/aliciatay-zls/banking/backend/domain CustomerRepository
type CustomerRepository interface { //repo (secondary port)
	FindAll(string) ([]Customer, *errs.AppError)
	FindById(string) (*Customer, *errs.AppError) //allows nil customer, useful for checking
}
