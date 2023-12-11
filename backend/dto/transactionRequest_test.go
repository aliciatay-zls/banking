package dto

import (
	"github.com/asaskevich/govalidator"
	"github.com/udemy-go-1/banking-lib/logger"
	"net/http"
	"testing"
)

const dummyCustomerId = "2"

const dummyAccountId = "1977"
const dummyAmount float64 = 1000.00

func init() {
	govalidator.SetFieldsRequiredByDefault(true)
	logger.MuteLogger()
}

// getDefaultValidTransactionRequest returns a TransactionRequest for the customer with id 2 wanting to make
// a deposit of amount 1000.00 on the account numbered 1977
func getDefaultValidTransactionRequest() TransactionRequest {
	return TransactionRequest{
		AccountId:       dummyAccountId,
		Amount:          dummyAmount,
		TransactionType: TransactionTypeDeposit,
		CustomerId:      dummyCustomerId,
	}
}

func TestTransactionRequest_Validate_returns_nil_when_amount_valid_and_transactionType_valid(t *testing.T) {
	//Arrange
	request := getDefaultValidTransactionRequest()

	//Act
	err := request.Validate()

	//Assert
	if err != nil {
		t.Error("expected no error but got error while testing valid values: " + err.Message)
	}
}

func TestTransactionRequest_Validate_returns_nil_when_amount_at_boundaries(t *testing.T) {
	//Arrange
	req1 := getDefaultValidTransactionRequest()
	req1.Amount = 0
	req2 := getDefaultValidTransactionRequest()
	req2.Amount = 99999999.99
	tests := []struct {
		name    string
		request TransactionRequest
	}{
		{"lower boundary", req1},
		{"upper boundary", req2},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			//Act
			err := tc.request.Validate()

			//Assert
			if err != nil {
				t.Errorf("expected no error but got error while testing transaction amount %v: %s",
					tc.request.Amount, err.Message)
			}
		})
	}
}

func TestTransactionRequest_Validate_returns_error_when_amount_negative(t *testing.T) {
	//Arrange
	request := getDefaultValidTransactionRequest()
	request.Amount = -100
	expectedErrMessage := "Transaction amount cannot be less than $0"
	expectedCode := http.StatusUnprocessableEntity

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
}

func TestTransactionRequest_Validate_returns_error_when_transactionType_invalid_or_empty(t *testing.T) {
	//Arrange
	req1 := getDefaultValidTransactionRequest()
	req1.TransactionType = "some transaction type"
	req2 := TransactionRequest{AccountId: dummyAccountId, Amount: dummyAmount, CustomerId: dummyCustomerId}
	tests := []struct {
		name    string
		request TransactionRequest
	}{
		{"type is invalid", req1},
		{"type is empty", req2},
	}

	expectedErrMessage := "Transaction type should be withdrawal or deposit"
	expectedCode := http.StatusUnprocessableEntity

	for _, tc := range tests {
		//Act
		actualErr := tc.request.Validate()

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
	}
}
