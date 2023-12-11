package dto

import (
	"github.com/asaskevich/govalidator"
	"github.com/udemy-go-1/banking-lib/logger"
	"net/http"
	"testing"
)

func init() {
	govalidator.SetFieldsRequiredByDefault(true)
	logger.MuteLogger()
}

// getDefaultValidNewAccountRequest returns a NewAccountRequest for the customer with id 2 wanting to open
// a saving account of amount 5000
func getDefaultValidNewAccountRequest() NewAccountRequest {
	return NewAccountRequest{
		CustomerId:  dummyCustomerId,
		AccountType: AccountTypeSaving,
		Amount:      NewAccountMinAmountAllowed,
	}
}

func TestNewAccountRequest_Validate_returns_nil_when_all_valid_and_filled(t *testing.T) {
	//Arrange
	request := getDefaultValidNewAccountRequest()

	//Act
	err := request.Validate()

	//Assert
	if err != nil {
		t.Error("expected no error but got error while testing valid values: " + err.Message)
	}
}

func TestNewAccountRequest_Validate_returns_error_when_amount_invalid_or_empty(t *testing.T) {
	//Arrange
	req1 := getDefaultValidNewAccountRequest()
	req1.Amount = 4999.99
	req2 := getDefaultValidNewAccountRequest()
	req2.Amount = 0
	req3 := NewAccountRequest{CustomerId: "2000", AccountType: AccountTypeSaving}
	tests := []struct {
		name    string
		request NewAccountRequest
	}{
		{"lower boundary", req1},
		{"amount is zero", req2},
		{"amount is empty", req3},
	}

	expectedErrMessage := "To open an account you must deposit at least $5000"
	expectedCode := http.StatusUnprocessableEntity

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			//Act
			actualErr := tc.request.Validate()

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
		})
	}
}

func TestNewAccountRequest_Validate_returns_error_when_accountType_invalid_or_empty(t *testing.T) {
	//Arrange
	req1 := getDefaultValidNewAccountRequest()
	req1.AccountType = "some account type"
	req2 := NewAccountRequest{CustomerId: dummyCustomerId, Amount: NewAccountMinAmountAllowed}
	tests := []struct {
		name    string
		request NewAccountRequest
	}{
		{"type invalid", req1},
		{"type empty", req2},
	}

	expectedErrMessage := "Account type should be saving or checking"
	expectedCode := http.StatusUnprocessableEntity

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			//Act
			actualErr := tc.request.Validate()

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
		})
	}
}
