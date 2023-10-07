package dto

import (
	"github.com/udemy-go-1/banking-lib/logger"
	"net/http"
	"testing"
)

// getDefaultValidNewAccountRequest returns a NewAccountRequest for the customer with id 2000 wanting to open
// a saving account of amount 5000
func getDefaultValidNewAccountRequest() NewAccountRequest {
	var amt float64 = NewAccountMinAmountAllowed
	var tType string = AccountTypeSaving
	return NewAccountRequest{
		CustomerId:  "2000",
		AccountType: &tType,
		Amount:      &amt,
	}
}

func TestNewAccountRequest_Validate_returns_nil_when_amount_valid_and_accountType_valid(t *testing.T) {
	//Arrange
	request := getDefaultValidNewAccountRequest()

	//Act
	err := request.Validate()

	//Assert
	if err != nil {
		t.Error("expected no error but got error while testing valid values: " + err.Message)
	}
}

func TestNewAccountRequest_Validate_returns_error_when_amount_invalid(t *testing.T) {
	//Arrange
	request := getDefaultValidNewAccountRequest()
	*request.Amount = 4999
	expectedErrMessage := "To open an account you must deposit at least 5000"
	expectedCode := http.StatusUnprocessableEntity

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "New account amount is invalid"

	//Act
	actualErr := request.Validate()

	//Assert
	if actualErr == nil {
		t.Fatal("expected error but got none while testing new account amount")
	}
	if actualErr.Message != expectedErrMessage {
		t.Errorf("expected message: \"%s\", actual message: \"%s\"", expectedErrMessage, actualErr.Message)
	}
	if actualErr.Code != expectedCode {
		t.Errorf("expected status code: \"%d\", actual status code: \"%d\"", expectedCode, actualErr.Code)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}

func TestNewAccountRequest_Validate_returns_error_when_accountType_invalid(t *testing.T) {
	//Arrange
	request := getDefaultValidNewAccountRequest()
	*request.AccountType = "some account type"
	expectedErrMessage := "Account type should be saving or checking"
	expectedCode := http.StatusUnprocessableEntity

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "New account type is invalid"

	//Act
	actualErr := request.Validate()

	//Assert
	if actualErr == nil {
		t.Fatal("expected error but got none while testing new account type")
	}
	if actualErr.Message != expectedErrMessage {
		t.Errorf("expected message: \"%s\", actual message: \"%s\"", expectedErrMessage, actualErr.Message)
	}
	if actualErr.Code != expectedCode {
		t.Errorf("expected status code: \"%d\", actual status code: \"%d\"", expectedCode, actualErr.Code)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}
