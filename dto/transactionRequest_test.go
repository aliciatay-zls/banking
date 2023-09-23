package dto

import (
	"github.com/udemy-go-1/banking-lib/logger"
	"net/http"
	"testing"
)

func getMinimumValidTransactionRequest() TransactionRequest {
	var amt float64 = 1000
	var tType string = TransactionTypeDeposit
	return TransactionRequest{
		Amount:          &amt,
		TransactionType: &tType,
	}
}

func TestTransactionRequest_Validate_NoErrorWhenAmountAndTransactionTypeValid(t *testing.T) {
	//Arrange
	request := getMinimumValidTransactionRequest()

	//Act
	err := request.Validate()

	//Assert
	if err != nil {
		t.Error("expected no error but got error while testing valid values: " + err.Message)
	}
}

func TestTransactionRequest_Validate_NoErrorWhenAmountZero(t *testing.T) {
	//Arrange
	request := getMinimumValidTransactionRequest()
	*request.Amount = 0

	//Act
	err := request.Validate()

	//Assert
	if err != nil {
		t.Error("expected no error but got error while testing transaction amount: " + err.Message)
	}
}

func TestTransactionRequest_Validate_ErrorWhenAmountNegative(t *testing.T) {
	//Arrange
	request := getMinimumValidTransactionRequest()
	*request.Amount = -100
	expectedErrMessage := "Transaction amount cannot be less than 0"
	expectedCode := http.StatusUnprocessableEntity

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Transaction amount is invalid"

	//Act
	actualErr := request.Validate()

	//Assert
	if actualErr == nil {
		t.Fatal("expected error but got none while testing transaction amount")
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

func TestTransactionRequest_Validate_ErrorWhenTransactionTypeInvalid(t *testing.T) {
	//Arrange
	request := getMinimumValidTransactionRequest()
	*request.TransactionType = "some transaction type"
	expectedErrMessage := "Transaction type should be withdrawal or deposit"
	expectedCode := http.StatusUnprocessableEntity

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Transaction type is invalid"

	//Act
	actualErr := request.Validate()

	//Assert
	if actualErr == nil {
		t.Fatal("expected error but got none while testing transaction type")
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
