package app

import (
	"bytes"
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking/dto"
	"github.com/udemy-go-1/banking/mocks/service"
	"go.uber.org/mock/gomock"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Test variables
var mockAccountService *service.MockAccountService
var ah AccountHandler

func setupAccountHandlerTest(t *testing.T, path string, payload string) func() {
	ctrl := gomock.NewController(t)
	mockAccountService = service.NewMockAccountService(ctrl)
	ah = AccountHandler{mockAccountService}

	router = mux.NewRouter()

	recorder = httptest.NewRecorder()
	request = httptest.NewRequest(http.MethodPost, path, bytes.NewBuffer([]byte(payload)))

	return func() {
		router = nil
		recorder = nil
		request = nil
		defer ctrl.Finish()
	}
}

// customer with id as 2 wants to open new saving account with amount 6000
func getNewAccountDefaultDummyInputs() (string, dto.NewAccountRequest) {
	dummyPayload := `{"account_type": "saving", "amount": 6000}`

	var dummyAccountType = "saving"
	var dummyAmount float64 = 6000
	dummyNewAccountRequest := dto.NewAccountRequest{
		CustomerId:  "2",
		AccountType: &dummyAccountType,
		Amount:      &dummyAmount,
	}

	return dummyPayload, dummyNewAccountRequest
}

// customer with id as 2 and account number as 1977 wants to make a deposit of amount 6000
func getNewTransactionDefaultDummyInputs() (string, dto.TransactionRequest) {
	dummyPayload := `{"transaction_type": "deposit", "amount": 6000}`

	var dummyTransactionType = "deposit"
	var dummyAmount float64 = 6000
	dummyNewTransactionRequest := dto.TransactionRequest{
		AccountId:       "1977",
		Amount:          &dummyAmount,
		TransactionType: &dummyTransactionType,
		CustomerId:      "2",
	}

	return dummyPayload, dummyNewTransactionRequest
}

func TestAccountHandler_newAccountHandler_NoAccountWithErrorStatusCodeWhenPayloadMalformed(t *testing.T) {
	//Arrange
	badPayload := `{"account_type": "saving", "amount": "string instead of number"}`
	teardown := setupAccountHandlerTest(t, "/customers/2/account", badPayload)
	defer teardown()
	router.HandleFunc("/customers/{customer_id:[0-9]+}/account", ah.newAccountHandler).Methods(http.MethodPost)

	expectedStatusCode := http.StatusBadRequest

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != expectedStatusCode {
		t.Errorf("Expecting status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
	}
}

func TestAccountHandler_newAccountHandler_NoAccountWithErrorWhenPayloadFieldMissingOrNull(t *testing.T) {
	badPayloads := []string{`{"account_type": "saving"}`, `{"account_type": "saving", "amount": null}`}

	for index, payload := range badPayloads {
		log.Printf("Testing with payload number %d: %s", index+1, payload)

		//Arrange
		teardown := setupAccountHandlerTest(t, "/customers/2/account", payload)
		router.HandleFunc("/customers/{customer_id:[0-9]+}/account", ah.newAccountHandler).Methods(http.MethodPost)

		expectedStatusCode := http.StatusBadRequest
		expectedResponse := "\"Field(s) missing or null in request body: account_type, amount\""

		//Act
		router.ServeHTTP(recorder, request)

		//Assert
		if recorder.Result().StatusCode != expectedStatusCode {
			t.Errorf("Expecting status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
		}
		actualResponse, _ := io.ReadAll(recorder.Result().Body)
		if !strings.Contains(string(actualResponse), expectedResponse) {
			t.Errorf("Expecting response to contain %s but got %s", expectedResponse, actualResponse)
		}

		//Cleanup
		teardown()
	}

}

func TestAccountHandler_newAccountHandler_NewAccountWithStatusCode200WhenServiceSucceeds(t *testing.T) {
	//Arrange
	dummyPayload, dummyNewAccountRequest := getNewAccountDefaultDummyInputs()
	teardown := setupAccountHandlerTest(t, "/customers/2/account", dummyPayload)
	defer teardown()
	router.HandleFunc("/customers/{customer_id:[0-9]+}/account", ah.newAccountHandler).Methods(http.MethodPost)

	dummyAccount := dto.NewAccountResponse{AccountId: "1977"}
	mockAccountService.EXPECT().CreateNewAccount(dummyNewAccountRequest).Return(&dummyAccount, nil)
	expectedStatusCode := http.StatusCreated

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != expectedStatusCode {
		t.Errorf("Expecting status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), dummyAccount.AccountId) {
		t.Errorf("Expecting response to contain %s but got %s", dummyAccount.AccountId, actualResponse)
	}
}

func TestAccountHandler_newAccountHandler_NoAccountWithErrorStatusCodeWhenServiceFails(t *testing.T) {
	//Arrange
	dummyPayload, dummyNewAccountRequest := getNewAccountDefaultDummyInputs()
	teardown := setupAccountHandlerTest(t, "/customers/2/account", dummyPayload)
	defer teardown()
	router.HandleFunc("/customers/{customer_id:[0-9]+}/account", ah.newAccountHandler).Methods(http.MethodPost)

	dummyAppError := errs.NewUnexpectedError("some error message")
	mockAccountService.EXPECT().CreateNewAccount(dummyNewAccountRequest).Return(nil, dummyAppError)

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != dummyAppError.Code {
		t.Errorf("Expecting status code %d but got %d", dummyAppError.Code, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), dummyAppError.Message) {
		t.Errorf("Expecting response to contain %s but got %s", dummyAppError.Message, actualResponse)
	}
}

func TestAccountHandler_transactionHandler_NoTransactionWithErrorStatusCodeWhenPayloadMalformed(t *testing.T) {
	//Arrange
	badPayload := `{"transaction_type": "deposit", "amount": "string instead of number"}`
	teardown := setupAccountHandlerTest(t, "/customers/2/account/1977", badPayload)
	defer teardown()
	router.HandleFunc("/customers/{customer_id:[0-9]+}/account/{account_id:[0-9]+}", ah.transactionHandler).Methods(http.MethodPost)

	expectedStatusCode := http.StatusBadRequest

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != expectedStatusCode {
		t.Errorf("Expecting status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
	}
}

func TestAccountHandler_transactionHandler_NoTransactionWithErrorWhenPayloadFieldMissingOrNull(t *testing.T) {
	badPayloads := []string{`{"amount": 6000}`, `{"transaction_type": null, "amount": 6000}`}

	for index, payload := range badPayloads {
		log.Printf("Testing with payload number %d: %s", index+1, payload)

		//Arrange
		teardown := setupAccountHandlerTest(t, "/customers/2/account/1977", payload)
		router.HandleFunc("/customers/{customer_id:[0-9]+}/account/{account_id:[0-9]+}", ah.transactionHandler).Methods(http.MethodPost)

		expectedStatusCode := http.StatusBadRequest
		expectedResponse := "\"Field(s) missing or null in request body: transaction_type, amount\""

		//Act
		router.ServeHTTP(recorder, request)

		//Assert
		if recorder.Result().StatusCode != expectedStatusCode {
			t.Errorf("Expecting status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
		}
		actualResponse, _ := io.ReadAll(recorder.Result().Body)
		if !strings.Contains(string(actualResponse), expectedResponse) {
			t.Errorf("Expecting response to contain %s but got %s", expectedResponse, actualResponse)
		}

		//Cleanup
		teardown()
	}

}

func TestAccountHandler_transactionHandler_NewTransactionWithStatusCode200WhenServiceSucceeds(t *testing.T) {
	//Arrange
	dummyPayload, dummyNewTransactionRequest := getNewTransactionDefaultDummyInputs()
	teardown := setupAccountHandlerTest(t, "/customers/2/account/1977", dummyPayload)
	defer teardown()
	router.HandleFunc("/customers/{customer_id:[0-9]+}/account/{account_id:[0-9]+}", ah.transactionHandler)

	dummyTransaction := dto.TransactionResponse{TransactionId: "7791", Balance: 12000}
	mockAccountService.EXPECT().MakeTransaction(dummyNewTransactionRequest).Return(&dummyTransaction, nil)
	expectedStatusCode := http.StatusCreated

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != expectedStatusCode {
		t.Errorf("Expected status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), dummyTransaction.TransactionId) {
		t.Errorf("Expecting response to contain %s but got %s", dummyTransaction.TransactionId, actualResponse)
	}
}

func TestAccountHandler_transactionHandler_NoTransactionWithErrorStatusCodeWhenServiceFails(t *testing.T) {
	//Arrange
	dummyPayload, dummyNewTransactionRequest := getNewTransactionDefaultDummyInputs()
	teardown := setupAccountHandlerTest(t, "/customers/2/account/1977", dummyPayload)
	defer teardown()
	router.HandleFunc("/customers/{customer_id:[0-9]+}/account/{account_id:[0-9]+}", ah.transactionHandler)

	dummyAppError := errs.NewUnexpectedError("some error message")
	mockAccountService.EXPECT().MakeTransaction(dummyNewTransactionRequest).Return(nil, dummyAppError)

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != dummyAppError.Code {
		t.Errorf("Expected status code %d but got %d", dummyAppError.Code, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), dummyAppError.Message) {
		t.Errorf("Expecting response to contain %s but got %s", dummyAppError.Message, actualResponse)
	}
}
