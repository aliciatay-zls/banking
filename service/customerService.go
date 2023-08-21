package service

import "github.com/aliciatay-zls/banking/domain"

type CustomerService interface { //service (port)
	GetAllCustomers() ([]domain.Customer, error)
}

type DefaultCustomerService struct { //business object
	repo domain.CustomerRepository //Business has dependency on repo (repo is a field)
}

func (s DefaultCustomerService) GetAllCustomers() ([]domain.Customer, error) { //Business implements service
	return s.repo.FindAll() //Business has dependency on repo (calls its method, which for now calls a stubbed implementation of the method)
}

func NewCustomerService(repository domain.CustomerRepository) DefaultCustomerService { //helper function to create and initialize a business object
	return DefaultCustomerService{repository}
}
