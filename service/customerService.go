package service

import (
	"github.com/aliciatay-zls/banking/domain"
	"github.com/aliciatay-zls/banking/dto"
	"github.com/aliciatay-zls/banking/errs"
	"github.com/aliciatay-zls/banking/logger"
)

type CustomerService interface { //service (primary port)
	GetAllCustomers(string) ([]dto.CustomerResponse, *errs.AppError)
	GetCustomer(string) (*dto.CustomerResponse, *errs.AppError)
}

type DefaultCustomerService struct { //business/domain object
	repo domain.CustomerRepository //Business Domain has dependency on repo (repo is a field)
}

func (s DefaultCustomerService) GetAllCustomers(status string) ([]dto.CustomerResponse, *errs.AppError) { //Business Domain implements service
	if status == "" {
		status = ""
	} else if status == "active" {
		status = "1"
	} else if status == "inactive" {
		status = "0"
	} else {
		logger.Error("Invalid value given for status query param")
		return nil, errs.NewNotFoundError("Invalid status")
	}

	customers, err := s.repo.FindAll(status) //Business has dependency on repo (*) //connects primary port to secondary port (**)
	if err != nil {
		return nil, err
	}

	response := make([]dto.CustomerResponse, 0)
	for _, c := range customers {
		response = append(response, c.ToDTO())
	}

	return response, nil
}

func (s DefaultCustomerService) GetCustomer(id string) (*dto.CustomerResponse, *errs.AppError) { //Business Domain implements service
	c, err := s.repo.FindById(id)
	if err != nil {
		return nil, err
	}

	response := c.ToDTO()

	return &response, nil
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
