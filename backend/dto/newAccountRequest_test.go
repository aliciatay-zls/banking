package dto

import (
	"github.com/udemy-go-1/banking-lib/formValidator"
	"github.com/udemy-go-1/banking-lib/logger"
	"net/http"
	"testing"
)

func init() {
	formValidator.Create()
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

func TestNewAccountRequest_Validate_returns_nil_when_amount_valid(t *testing.T) {
	//Arrange
	tests := []struct {
		name   string
		amount float64
	}{
		{"lower boundary", NewAccountMinAmountAllowed},
		{"upper boundary", 99999999},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			request := getDefaultValidNewAccountRequest()
			request.Amount = tc.amount

			//Act
			err := request.Validate()

			//Assert
			if err != nil {
				t.Errorf("expected no error but got error while testing valid new account amount %v: %s",
					request.Amount, err.Message)
			}
		})
	}
}

func TestNewAccountRequest_Validate_returns_error_when_amount_invalid(t *testing.T) {
	//Arrange
	tests := []struct {
		name       string
		invalidAmt float64
	}{
		{"below lower boundary", 4999.99},
		{"above upper boundary", 100000000.00},
		{"zero", 0},
	}
	request := getDefaultValidNewAccountRequest()

	expectedErrMessage := "Please check that the initial amount is valid."
	expectedCode := http.StatusUnprocessableEntity

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			request.Amount = tc.invalidAmt

			//Act
			actualErr := request.Validate()

			//Assert
			if actualErr == nil {
				t.Fatal("expected error but got none while testing invalid new account amount")
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

func TestNewAccountRequest_Validate_returns_error_when_accountType_invalid(t *testing.T) {
	//Arrange
	request := getDefaultValidNewAccountRequest()
	request.AccountType = "some account type"

	expectedErrMessage := "Account type should be saving or checking."
	expectedCode := http.StatusUnprocessableEntity

	//Act
	actualErr := request.Validate()

	//Assert
	if actualErr == nil {
		t.Fatal("expected error but got none while testing invalid new account type")
	}
	if actualErr.Message != expectedErrMessage {
		t.Errorf("expected message: \"%s\", actual message: \"%s\"", expectedErrMessage, actualErr.Message)
	}
	if actualErr.Code != expectedCode {
		t.Errorf("expected status code: \"%d\", actual status code: \"%d\"", expectedCode, actualErr.Code)
	}
}

func TestNewAccountRequest_Validate_returns_error_when_field_empty(t *testing.T) {
	//Arrange
	tests := []struct {
		name               string
		request            NewAccountRequest
		expectedErrMessage string
	}{
		{"amount empty", NewAccountRequest{CustomerId: "2000", AccountType: AccountTypeSaving}, "Please check that the initial amount is valid."},
		{"type empty", NewAccountRequest{CustomerId: dummyCustomerId, Amount: NewAccountMinAmountAllowed}, "Account type should be saving or checking."},
	}

	expectedCode := http.StatusUnprocessableEntity

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			//Act
			actualErr := tc.request.Validate()

			//Assert
			if actualErr == nil {
				t.Fatal("expected error but got none while testing empty fields in new account")
			}
			if actualErr.Message != tc.expectedErrMessage {
				t.Errorf("expected message: \"%s\", actual message: \"%s\"", tc.expectedErrMessage, actualErr.Message)
			}
			if actualErr.Code != expectedCode {
				t.Errorf("expected status code: \"%d\", actual status code: \"%d\"", expectedCode, actualErr.Code)
			}
		})
	}
}
