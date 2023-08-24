package service

import (
	"github.com/aliciatay-zls/banking/domain"
	"github.com/aliciatay-zls/banking/errs"
	"log"
)

type CustomerService interface { //service (primary port)
	GetAllCustomers(string) ([]domain.Customer, *errs.AppError)
	GetCustomer(string) (*domain.Customer, *errs.AppError)
}

type DefaultCustomerService struct { //business object
	repo domain.CustomerRepository //Business has dependency on repo (repo is a field)
}

func (s DefaultCustomerService) GetAllCustomers(status string) ([]domain.Customer, *errs.AppError) { //Business implements service
	if status == "" {
		status = ""
	} else if status == "active" {
		status = "1"
	} else if status == "inactive" {
		status = "0"
	} else {
		log.Println("Invalid value for status query param")
		return nil, errs.NewNotFoundError("Invalid status")
	}
	return s.repo.FindAll(status) //Business has dependency on repo (*) //connects primary port to secondary port (**)
}

func (s DefaultCustomerService) GetCustomer(id string) (*domain.Customer, *errs.AppError) {
	return s.repo.FindById(id)
}

func NewCustomerService(repository domain.CustomerRepository) DefaultCustomerService { //helper function to create and initialize a business object
	return DefaultCustomerService{repository}
}

// (*)
//calls repo's method, which is either the stub implementation or the DB implementation, depending on whether repo is of
//type domain.CustomerRepositoryStub or domain.CustomerRepositoryDb respectively
//  - both implement CustomerRepository i.e. implement FindAll()
//  - depends on what repo was passed into NewCustomerService() since it intializes the repo field in DefaultCustomerService

// (**)
//service/primary port consists of method GetAllCustomers(), which calls repo/secondary port's method
//hence the two ports are connected
