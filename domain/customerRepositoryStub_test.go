package domain

import (
	"github.com/udemy-go-1/banking-lib/logger"
	"testing"
)

func TestCustomerRepositoryStub_FindAll_CorrectCustomersSet(t *testing.T) {
	//Arrange
	customerRepositoryStub := NewCustomerRepositoryStub()
	status := ""
	expectedCustomers := []Customer{
		{"1", "Dorothy", "Emerald City", "12345", "11/11/2011", "1"},
		{"2", "Luke", "Tatooine", "67890", "12/12/2012", "0"},
	}

	//Act
	actualCustomers, err := customerRepositoryStub.FindAll(status)
	if err != nil {
		t.Error("expected no error but got error while testing default dummy data: " + err.Message)
	}

	//Assert
	for k, _ := range expectedCustomers {
		if actualCustomers[k] != expectedCustomers[k] {
			t.Errorf("expected customer %s but got customer %s", expectedCustomers[k], actualCustomers[k])
		}
	}
}

func TestCustomerRepositoryStub_FindById_CorrectCustomerWhenIdExists(t *testing.T) {
	//Arrange
	customerRepositoryStub := NewCustomerRepositoryStub()
	id := "1"
	expectedCustomer := &Customer{
		Id:          id,
		Name:        "Dorothy",
		City:        "Emerald City",
		Zipcode:     "12345",
		DateOfBirth: "11/11/2011",
		Status:      "1",
	}

	//Act
	actualCustomer, err := customerRepositoryStub.FindById(id)

	//Assert
	if err != nil {
		t.Fatal("expected no error but got error while testing existent customer id: " + err.Message)
	}
	if *actualCustomer != *expectedCustomer {
		t.Error("expected customer is different from actual customer")
	}
}

func TestCustomerRepositoryStub_FindById_ErrorWhenIdDoesNotExist(t *testing.T) {
	//Arrange
	customerRepositoryStub := NewCustomerRepositoryStub()
	id := "321"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while finding customer by id using stub for CustomerRepository: not found"

	//Act
	actualCustomer, err := customerRepositoryStub.FindById(id)

	//Assert
	if err == nil {
		t.Error("expected error but got none while testing non-existent customer id")
	}
	if actualCustomer != nil {
		t.Error("expected no customer to be returned but got a customer")
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}
