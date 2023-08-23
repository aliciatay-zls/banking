package service

import "github.com/aliciatay-zls/banking/domain"

type CustomerService interface { //service (primary port)
	GetAllCustomers() ([]domain.Customer, error)
	GetCustomer(string) (*domain.Customer, error)
}

type DefaultCustomerService struct { //business object
	repo domain.CustomerRepository //Business has dependency on repo (repo is a field)
}

func (s DefaultCustomerService) GetAllCustomers() ([]domain.Customer, error) { //Business implements service
	return s.repo.FindAll() //Business has dependency on repo (*) //connects primary port to secondary port (**)
}

func (s DefaultCustomerService) GetCustomer(id string) (*domain.Customer, error) {
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
