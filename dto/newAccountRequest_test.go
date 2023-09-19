package dto

import (
	"github.com/udemy-go-1/banking-lib/logger"
	"net/http"
	"testing"
)

func getDefaultValidNewAccountRequest() NewAccountRequest {
	var amt float64 = NewAccountMinAmountAllowed
	var tType string = AccountTypeSaving
	return NewAccountRequest{
		CustomerId:  "2000",
		AccountType: &tType,
		Amount:      &amt,
	}
}

func TestNewAccountRequest_Validate_NoErrorWhenAmountAndAccountTypeValid(t *testing.T) {
	//Arrange
	request := getDefaultValidNewAccountRequest()

	//Act
	err := request.Validate()

	//Assert
	if err != nil {
		t.Error("expected no error but got error while testing valid values: " + err.Message)
	}
}

func TestNewAccountRequest_Validate_ErrorWhenAmountInvalid(t *testing.T) {
	//Arrange
	request := getDefaultValidNewAccountRequest()
	*request.Amount = 4999
	expectedMsg := "To open an account you must deposit at least 5000"
	expectedCode := http.StatusUnprocessableEntity

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "New account amount is invalid"

	//Act
	err := request.Validate()

	//Assert
	if err == nil {
		t.Fatal("expected error but got none while testing new account amount")
	}
	if err.Message != expectedMsg {
		t.Errorf("expected message: \"%s\", actual message: \"%s\"", expectedMsg, err.Message)
	}
	if err.Code != expectedCode {
		t.Errorf("expected status code: \"%d\", actual status code: \"%d\"", expectedCode, err.Code)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}

func TestNewAccountRequest_Validate_ErrorWhenAccountTypeInvalid(t *testing.T) {
	//Arrange
	request := getDefaultValidNewAccountRequest()
	*request.AccountType = "some account type"
	expectedMsg := "Account type should be saving or checking"
	expectedCode := http.StatusUnprocessableEntity

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "New account type is invalid"

	//Act
	err := request.Validate()

	//Assert
	if err == nil {
		t.Fatal("expected error but got none while testing new account type")
	}
	if err.Message != expectedMsg {
		t.Errorf("expected message: \"%s\", actual message: \"%s\"", expectedMsg, err.Message)
	}
	if err.Code != expectedCode {
		t.Errorf("expected status code: \"%d\", actual status code: \"%d\"", expectedCode, err.Code)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}
