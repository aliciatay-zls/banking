package dto

import (
	"github.com/udemy-go-1/banking-lib/formValidator"
	"github.com/udemy-go-1/banking-lib/logger"
	"net/http"
	"testing"
)

const dummyCustomerId = "2"

const dummyAccountId = "1977"
const dummyAmount float64 = 1000.00

func init() {
	formValidator.Create()
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

func TestTransactionRequest_Validate_returns_nil_when_amount_valid(t *testing.T) {
	//Arrange
	tests := []struct {
		name   string
		amount float64
	}{
		{"zero", 0},
		{"in range", dummyAmount},
		{"lower boundary", TransactionMinAmountAllowed},
		{"upper boundary", TransactionMaxAmountAllowed},
	}
	request := getDefaultValidTransactionRequest()

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			request.Amount = tc.amount

			//Act
			err := request.Validate()

			//Assert
			if err != nil {
				t.Errorf("expected no error but got error while testing valid transaction amount %v: %s",
					request.Amount, err.Message)
			}
		})
	}
}

func TestTransactionRequest_Validate_returns_error_when_amount_invalid(t *testing.T) {
	//Arrange
	tests := []struct {
		name   string
		amount float64
	}{
		{"below lower boundary", -1},
		{"above upper boundary", 10000.10},
	}
	request := getDefaultValidTransactionRequest()

	expectedErrMessage := "Please check that the transaction amount is valid."
	expectedCode := http.StatusUnprocessableEntity

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			request.Amount = tc.amount

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
		})
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

	expectedErrMessage := "Transaction type should be withdrawal or deposit."
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
