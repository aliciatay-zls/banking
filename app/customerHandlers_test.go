package app

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking/dto"
	"github.com/udemy-go-1/banking/mocks/service"
	"go.uber.org/mock/gomock"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Test variables
var mockCustomerService *service.MockCustomerService
var ch CustomerHandlers

// Package variables
var router *mux.Router
var recorder *httptest.ResponseRecorder
var request *http.Request

// setupCustomerHandlersTest initializes the above variables and returns a function that should be called at the end
// of each test to reset the variables and other cleanup tasks. setup takes in a path string for building request.
func setupCustomerHandlersTest(t *testing.T, path string) func() {
	ctrl := gomock.NewController(t)
	mockCustomerService = service.NewMockCustomerService(ctrl)
	ch = CustomerHandlers{mockCustomerService}

	router = mux.NewRouter()

	recorder = httptest.NewRecorder()
	request = httptest.NewRequest(http.MethodGet, path, nil)

	return func() {
		router = nil
		recorder = nil
		request = nil
		defer ctrl.Finish()
	}
}

func TestCustomerHandlers_customersHandler_CustomersWithStatusCode200WhenServiceSucceeds(t *testing.T) {
	//Arrange
	teardown := setupCustomerHandlersTest(t, "/customers")
	defer teardown()
	router.HandleFunc("/customers", ch.customersHandler)

	dummyCustomers := []dto.CustomerResponse{
		{"1", "Dorothy", "Emerald City", "12345", "11/11/2011", "1"},
		{"2", "Luke", "Tatooine", "67890", "12/12/2012", "0"},
	}
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

func TestCustomerHandlers_customersHandler_NoCustomersWithErrorStatusCodeWhenServiceFails(t *testing.T) {
	//Arrange
	teardown := setupCustomerHandlersTest(t, "/customers")
	defer teardown()
	router.HandleFunc("/customers", ch.customersHandler)

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

func TestCustomerHandlers_customerIdHandler_CustomerWithStatusCode200WhenServiceSucceeds(t *testing.T) {
	//Arrange
	teardown := setupCustomerHandlersTest(t, "/customers/2")
	defer teardown()
	router.HandleFunc("/customers/{customer_id:[0-9]+}", ch.customerIdHandler)

	var dummyCustomerId = "2"
	dummyCustomer := dto.CustomerResponse{Id: dummyCustomerId, Name: "Luke", City: "Tatooine", Zipcode: "67890",
		DateOfBirth: "12/12/2012", Status: "0"}
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

func TestCustomerHandlers_customerIdHandler_NoCustomerWithErrorStatusCodeWhenServiceFails(t *testing.T) {
	//Arrange
	teardown := setupCustomerHandlersTest(t, "/customers/2")
	defer teardown()
	router.HandleFunc("/customers/{customer_id:[0-9]+}", ch.customerIdHandler)

	dummyAppError := errs.NewUnexpectedError("some error message")
	mockCustomerService.EXPECT().GetCustomer("2").Return(nil, dummyAppError)

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
	recorder = httptest.NewRecorder() //instead of calling setup()

	var dummyStatusCode = 200
	dummyData := dto.CustomerResponse{Id: "2", Name: "Luke", City: "Tatooine", Zipcode: "67890",
		DateOfBirth: "12/12/2012", Status: "0"}
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
		t.Error("Failed to decode dummy response")
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
