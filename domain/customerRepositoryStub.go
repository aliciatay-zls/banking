package domain

//Server

type CustomerRepositoryStub struct { //stub (adapter)
	customers []Customer
}

func (s CustomerRepositoryStub) FindAll() ([]Customer, error) { //stub implements repo
	return s.customers, nil //getter method for the stub
}

func NewCustomerRepositoryStub() CustomerRepositoryStub {
	customers := []Customer{ //default dummy data
		{"1", "Dorothy", "Emerald City", "12345", "11/11/2011", "back home"},
		{"2", "Luke", "Tatooine", "67890", "12/12/2012", "jedi"},
	}

	return CustomerRepositoryStub{customers} //helper function to create a stub (setter too)
}
