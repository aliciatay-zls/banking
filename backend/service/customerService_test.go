package service

import (
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/backend/domain"
	"github.com/udemy-go-1/banking/backend/dto"
	mocksDomain "github.com/udemy-go-1/banking/backend/mocks/domain"
	"go.uber.org/mock/gomock"
	"testing"
)

// Test common variables and inputs
var mockCustomerRepo *mocksDomain.MockCustomerRepository
var cusSvc CustomerService

const dummyStatus = ""
const dummyConvertedStatus = ""

func setupCustomerServiceTest(t *testing.T) func() {
	ctrl := gomock.NewController(t)
	mockCustomerRepo = mocksDomain.NewMockCustomerRepository(ctrl)
	cusSvc = NewCustomerService(mockCustomerRepo)

	return func() {
		mockCustomerRepo = nil
		defer ctrl.Finish()
	}
}

func getDefaultDummyCustomers() []domain.Customer {
	return []domain.Customer{
		{"1", "Dorothy", "11/11/2011", "dorothy_gale@somemail.com", "Emerald City", "12345", "1"},
		{"2", "Luke", "12/12/2012", "luke.skywalker@tsomemail.com", "Tatooine", "67890", "0"},
	}
}

func TestDefaultCustomerService_GetAllCustomers_returns_error_when_invalid_status(t *testing.T) {
	//Arrange
	cusSvc = NewCustomerService(nil)

	invalidStatus := "some status"
	expectedErrMessage := "Invalid status"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Unexpected customer status: " + invalidStatus

	//Act
	_, err := cusSvc.GetAllCustomers(invalidStatus)

	//Assert
	if err == nil {
		t.Fatal("Expected error but got none while testing invalid customer status")
	}
	if err.Message != expectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", expectedErrMessage, err.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}

func TestDefaultCustomerService_GetAllCustomers_returns_error_when_repo_fails(t *testing.T) {
	//Arrange
	teardown := setupCustomerServiceTest(t)
	defer teardown()

	dummyAppErr := errs.NewUnexpectedError("some error message")
	mockCustomerRepo.EXPECT().FindAll(dummyConvertedStatus).Return(nil, dummyAppErr)

	//Act
	_, err := cusSvc.GetAllCustomers(dummyStatus)

	//Assert
	if err == nil {
		t.Fatal("Expected error but got none while testing call to repo failing")
	}
	if err.Message != dummyAppErr.Message {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", dummyAppErr.Message, err.Message)
	}
}

func TestDefaultCustomerService_GetAllCustomers_returns_customers_when_repo_succeeds(t *testing.T) {
	//Arrange
	teardown := setupCustomerServiceTest(t)
	defer teardown()

	dummyCustomers := getDefaultDummyCustomers()
	mockCustomerRepo.EXPECT().FindAll(dummyConvertedStatus).Return(dummyCustomers, nil)

	expectedCustomerResponses := []dto.CustomerResponse{
		{"1", "Dorothy", "11/11/2011", "dorothy_gale@somemail.com", "Emerald City", "12345", "active"},
		{"2", "Luke", "12/12/2012", "luke.skywalker@tsomemail.com", "Tatooine", "67890", "inactive"},
	}

	//Act
	actualCustomerResponses, err := cusSvc.GetAllCustomers(dummyStatus)

	//Assert
	if err != nil {
		t.Error("Expected no error but got error while testing call to repo successful: " + err.Message)
	}
	if len(actualCustomerResponses) != len(expectedCustomerResponses) {
		t.Fatalf("Expected %d customers to be returned but got %d customers",
			len(expectedCustomerResponses), len(actualCustomerResponses))
	}
	for i, v := range actualCustomerResponses {
		if v != expectedCustomerResponses[i] {
			t.Errorf("Expected customer %v but got customer %v", expectedCustomerResponses[i], v)
		}
	}
}

func TestDefaultCustomerService_GetCustomer_returns_error_when_repo_fails(t *testing.T) {
	//Arrange
	teardown := setupCustomerServiceTest(t)
	defer teardown()

	nonExistentCustomerId := "321"
	dummyAppErr := errs.NewUnexpectedError("Customer not found")
	mockCustomerRepo.EXPECT().FindById(nonExistentCustomerId).Return(nil, dummyAppErr)

	//Act
	_, err := cusSvc.GetCustomer(nonExistentCustomerId)

	//Assert
	if err == nil {
		t.Fatal("Expected error but got none while testing call to repo failing")
	}
	if err.Message != dummyAppErr.Message {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", dummyAppErr.Message, err.Message)
	}
}

func TestDefaultCustomerService_GetCustomer_returns_a_customer_when_repo_succeeds(t *testing.T) {
	//Arrange
	teardown := setupCustomerServiceTest(t)
	defer teardown()

	dummyCustomer := getDefaultDummyCustomers()[1]
	mockCustomerRepo.EXPECT().FindById(dummyCustomer.Id).Return(&dummyCustomer, nil)

	expectedCustomerResponse := dummyCustomer.ToDTO()

	//Act
	actualCustomerResponse, err := cusSvc.GetCustomer(dummyCustomer.Id)

	//Assert
	if err != nil {
		t.Fatal("Expected no error but got error while testing call to repo successful: " + err.Message)
	}
	if *actualCustomerResponse != *expectedCustomerResponse {
		t.Errorf("Expected customer %v but got customer %v", expectedCustomerResponse, actualCustomerResponse)
	}
}
