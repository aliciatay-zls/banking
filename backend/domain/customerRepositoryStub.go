package domain

import (
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
)

//Server

type CustomerRepositoryStub struct { //stub (adapter)
	customers []Customer
}

func NewCustomerRepositoryStub() CustomerRepositoryStub { //helper function to create and initialize a stub
	customers := []Customer{ //default dummy data
		{"1", "Dorothy", "11/11/2011", "dorothy_gale@somemail.com", "Emerald City", "12345", "1"},
		{"2", "Luke", "12/12/2012", "luke.skywalker@tsomemail.com", "Tatooine", "67890", "0"},
	}
	return CustomerRepositoryStub{customers}
}

func (s CustomerRepositoryStub) FindAll(status string) ([]Customer, *errs.AppError) { //stub implements repo
	return s.customers, nil
}

func (s CustomerRepositoryStub) FindById(id string) (*Customer, *errs.AppError) { //stub implements repo
	for _, v := range s.customers {
		if v.Id == id {
			return &v, nil
		}
	}
	logger.Error("Error while finding customer by id using stub for CustomerRepository: not found")
	return nil, errs.NewNotFoundError("Customer not found")
}
