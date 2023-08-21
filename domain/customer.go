package domain

//Business

type Customer struct { //business object
	Id          string `json:"id"`
	Name        string `json:"name"`
	City        string `json:"city"`
	Zipcode     string `json:"zipCode"`
	DateOfBirth string `json:"dateOfBirth"`
	Status      string `json:"status"`
}

//Server

type CustomerRepository interface { //repo (secondary port)
	FindAll() ([]Customer, error)
}
