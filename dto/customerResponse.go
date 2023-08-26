package dto

type CustomerResponse struct { //DTO
	Id          string `json:"customer_id"`
	Name        string `json:"full_name"`
	City        string `json:"city"`
	Zipcode     string `json:"zipcode"`
	DateOfBirth string `json:"date_of_birth"`
	Status      string `json:"status"`
}

//Notes
//In between User and Business layers (REST handler and domain object).
//For converting domain object to DTO in service (conversion done by domain).
//DTO is then used passed up to REST handler and above (User layer).
