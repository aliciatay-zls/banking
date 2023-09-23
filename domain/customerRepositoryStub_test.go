package domain

import (
	"github.com/udemy-go-1/banking-lib/logger"
	"testing"
)

func getDefaultCustomers() []Customer {
	return []Customer{
		{"1", "Dorothy", "Emerald City", "12345", "11/11/2011", "1"},
		{"2", "Luke", "Tatooine", "67890", "12/12/2012", "0"},
	}
}

func TestCustomerRepositoryStub_FindAll_CorrectCustomersSet(t *testing.T) {
	//Arrange
	customerRepositoryStub := NewCustomerRepositoryStub()
	status := ""
	expectedCustomers := getDefaultCustomers()

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
	expectedCustomer := &getDefaultCustomers()[0]

	//Act
	actualCustomer, err := customerRepositoryStub.FindById(expectedCustomer.Id)

	//Assert
	if err != nil {
		t.Fatal("expected no error but got error while testing existent customer id: " + err.Message)
	}
	if *actualCustomer != *expectedCustomer {
		t.Error("expected customer is different from actual customer")
	}
}

func TestCustomerRepositoryStub_FindById_ErrorWhenNonExistentCustomer(t *testing.T) {
	//Arrange
	customerRepositoryStub := NewCustomerRepositoryStub()
	id := "321"
	expectedErrMessage := "Customer not found"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while finding customer by id using stub for CustomerRepository: not found"

	//Act
	_, actualErr := customerRepositoryStub.FindById(id)

	//Assert
	if actualErr == nil {
		t.Error("expected error but got none while testing non-existent customer id")
	}
	if actualErr.Message != expectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", expectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}
