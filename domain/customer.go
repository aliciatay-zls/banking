package domain

//Business

type Customer struct { //business object
	Id          string
	Name        string
	City        string
	Zipcode     string
	DateOfBirth string
	Status      string
}

//Server

type CustomerRepository interface { //repo (port)
	FindAll() ([]Customer, error)
}
