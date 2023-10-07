package app

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking/backend/dto"
	"github.com/udemy-go-1/banking/backend/mocks/service"
	"go.uber.org/mock/gomock"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Package common variables and inputs
var router *mux.Router
var recorder *httptest.ResponseRecorder
var request *http.Request

const dummyCustomerId = "2"

// Test common variables and inputs
var mockCustomerService *service.MockCustomerService
var ch CustomerHandlers
var dummyCustomers []dto.CustomerResponse

const customersPath = "/customers"
const customerIdPath = "/customers/{customer_id:[0-9]+}"
const dummyCustomerIdPath = "/customers/2"

// setupCustomerHandlersTest initializes the above variables and returns a function that should be called at the end
// of each test to reset the variables and other cleanup tasks. setup takes in a path string for building request.
func setupCustomerHandlersTest(t *testing.T, path string) func() {
	ctrl := gomock.NewController(t)
	mockCustomerService = service.NewMockCustomerService(ctrl)
	ch = CustomerHandlers{mockCustomerService}

	router = mux.NewRouter()

	recorder = httptest.NewRecorder()
	request = httptest.NewRequest(http.MethodGet, path, nil)

	setVariableDummyCustomers()

	return func() {
		router = nil
		recorder = nil
		request = nil
		defer ctrl.Finish()
	}
}

func setVariableDummyCustomers() {
	dummyCustomers = []dto.CustomerResponse{
		{"1", "Dorothy", "Emerald City", "12345", "11/11/2011", "1"},
		{"2", "Luke", "Tatooine", "67890", "12/12/2012", "0"},
	}
}

func TestCustomerHandlers_customersHandler_respondsWith_customersAndStatusCode200_when_service_succeeds(t *testing.T) {
	//Arrange
	teardown := setupCustomerHandlersTest(t, customersPath)
	defer teardown()
	router.HandleFunc(customersPath, ch.customersHandler)

	mockCustomerService.EXPECT().GetAllCustomers("").Return(dummyCustomers, nil)
	expectedStatusCode := http.StatusOK

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != expectedStatusCode {
		t.Errorf("Expected status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), dummyCustomers[0].Name) {
		t.Errorf("Expecting response to contain %s but got %s", dummyCustomers[0].Name, actualResponse)
	}
}

func TestCustomerHandlers_customersHandler_respondsWith_errorStatusCode_when_service_fails(t *testing.T) {
	//Arrange
	teardown := setupCustomerHandlersTest(t, customersPath)
	defer teardown()
	router.HandleFunc(customersPath, ch.customersHandler)

	dummyAppError := errs.NewUnexpectedError("some error message")
	mockCustomerService.EXPECT().GetAllCustomers("").Return(nil, dummyAppError)

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

func TestCustomerHandlers_customerIdHandler_respondsWith_customerAndStatusCode200_when_service_succeeds(t *testing.T) {
	//Arrange
	teardown := setupCustomerHandlersTest(t, dummyCustomerIdPath)
	defer teardown()
	router.HandleFunc(customerIdPath, ch.customerIdHandler)

	dummyCustomer := dummyCustomers[1]
	mockCustomerService.EXPECT().GetCustomer(dummyCustomerId).Return(&dummyCustomer, nil)
	expectedStatusCode := http.StatusOK

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != expectedStatusCode {
		t.Errorf("Expected status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), dummyCustomer.Name) {
		t.Errorf("Expecting response to contain %s but got %s", dummyCustomer.Name, actualResponse)
	}
}

func TestCustomerHandlers_customerIdHandler_respondsWith_errorStatusCode_when_service_fails(t *testing.T) {
	//Arrange
	teardown := setupCustomerHandlersTest(t, dummyCustomerIdPath)
	defer teardown()
	router.HandleFunc(customerIdPath, ch.customerIdHandler)

	dummyAppError := errs.NewUnexpectedError("some error message")
	mockCustomerService.EXPECT().GetCustomer(dummyCustomerId).Return(nil, dummyAppError)

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

func TestCustomerHandlers_writeJsonResponse(t *testing.T) {
	//Arrange
	setVariableDummyCustomers()
	recorder = httptest.NewRecorder()

	var dummyStatusCode = 200
	dummyData := dummyCustomers[1]
	var expectedHeaderKey = "Content-Type"
	var expectedHeaderVal = "application/json"

	//Act
	writeJsonResponse(recorder, dummyStatusCode, dummyData)

	//Assert
	if recorder.Result().Header.Get(expectedHeaderKey) != expectedHeaderVal {
		t.Errorf("Expected header \"%s\" to be \"%s\" but got \"%s\"",
			expectedHeaderKey, expectedHeaderVal, recorder.Result().Header.Get(expectedHeaderKey))
	}
	if recorder.Result().StatusCode != dummyStatusCode {
		t.Errorf("Expected status code to be %d but got %d", dummyStatusCode, recorder.Result().StatusCode)
	}
	var actualData dto.CustomerResponse
	if err := json.NewDecoder(recorder.Result().Body).Decode(&actualData); err != nil {
		t.Fatal("Failed to decode dummy response")
	}
	if actualData != dummyData {
		t.Errorf("Expected response to be %s but got %s", dummyData, actualData)
	}
}

//Notes on setup()
//  defer ctrl.Finish() is not needed anymore since go 1.14+ (using 1.20)
//  NewController() will already call ctrl.finish() which is what ctr.Finish() calls
//  but still included so can do other things in teardown() like reset global vars of type pointer

//No init() since no logging done in customerHandlers.go (logging mostly in lower levels)
