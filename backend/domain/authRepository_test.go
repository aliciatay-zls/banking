package domain

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/logger"
	"log"
	"net/http"
	"os"
	"strings"
	"testing"
)

// Package common variables and inputs
const dummyCustomerId = "2"
const dummyAccountId = "1977"

// Test common variables and inputs
var authRepo DefaultAuthRepository
var channelWaitForShutDown chan int
var channelDoShutDown chan int
var dummyRouteVars map[string]string

const envVarAuthServerAddr = "AUTH_SERVER_ADDRESS"
const envVarAuthServerPort = "AUTH_SERVER_PORT"

const verifyPath = "/auth/verify"
const dummyToken = "header.payload.signature"
const dummyRouteName = "SomeRouteName"

func setupAuthRepositoryTest(t *testing.T) {
	if err := os.Setenv(envVarAuthServerAddr, "localhost"); err != nil {
		t.Fatal("Error during testing setup: " + err.Error())
	}
	if err := os.Setenv(envVarAuthServerPort, "8585"); err != nil {
		t.Fatal("Error during testing setup: " + err.Error())
	}

	authRepo = NewDefaultAuthRepository()

	dummyRouteVars = map[string]string{"account_id": dummyAccountId, "customer_id": dummyCustomerId}
}

func getDummyVerifyAPIHandler(t *testing.T, dummyStatusCode int, dummyResponse interface{}) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(dummyStatusCode)
		if err := json.NewEncoder(w).Encode(dummyResponse); err != nil {
			t.Fatal("Error during testing setup: " + err.Error())
		}
	}
}

// startDummyAuthServer uses a new router each time it is called to register the verifyPath path to the given
// handler. It creates and starts a server and waits to shut down the server, which occurs when a value is
// sent into the channelWaitForShutDown channel. This should be done by the caller. The caller should also wait on
// the channelDoShutDown channel for this process to complete.
func startDummyAuthServer(dummyVerifyAPIHandler func(http.ResponseWriter, *http.Request)) {
	router := mux.NewRouter()
	router.HandleFunc(verifyPath, dummyVerifyAPIHandler)

	address := os.Getenv(envVarAuthServerAddr)
	port := os.Getenv(envVarAuthServerPort)

	dummyAuthServer := http.Server{
		Addr:    fmt.Sprintf("%s:%s", address, port),
		Handler: router,
	}

	channelWaitForShutDown = make(chan int) //sender
	channelDoShutDown = make(chan int, 1)   //receiver
	go func() {
		<-channelDoShutDown

		if err := dummyAuthServer.Shutdown(context.Background()); err != nil {
			log.Fatal("Error when shutting down dummy server: " + err.Error())
		}

		close(channelWaitForShutDown)
	}()

	go func() {
		if err := dummyAuthServer.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatal("Error while serving: " + err.Error())
		}
	}()
}

// e.g. auth server is not started
func TestDefaultAuthRepository_IsAuthorized_returns_error_when_error_sending_request(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	expectedErrMessage := "Internal server error"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessagePrefix := "Error while sending request to verification URL: "

	//Act
	actualErr := authRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if actualErr == nil {
		t.Error("Expected error but got none")
	}
	if actualErr.Message != expectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", expectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 { //does not run app.go so no info level logs will be generated (at this point in the actual code, only 1 log is recorded)
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if !strings.Contains(actualLogMessage, expectedLogMessagePrefix) {
		t.Errorf("Expected log message to contain \"%s\" but got log message: \"%s\"", expectedLogMessagePrefix, actualLogMessage)
	}
}

// auth server handler sends response of a type that the app cannot handle (unexpected response object type)
func TestDefaultAuthRepository_IsAuthorized_returns_error_when_error_decoding_authServerResponse(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	dummyStatusCode := http.StatusForbidden
	dummyUnexpectedResponse := map[int]int{
		0: 123,
	}
	expectedErrMessage := "Internal server error"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessagePrefix := "Error while reading response from auth server: "

	dummyVerifyAPIHandler := getDummyVerifyAPIHandler(t, dummyStatusCode, dummyUnexpectedResponse)
	startDummyAuthServer(dummyVerifyAPIHandler)

	//Act
	actualErr := authRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if actualErr == nil {
		t.Error("Expected error but got none")
	}
	if actualErr.Message != expectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", expectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if !strings.Contains(actualLogMessage, expectedLogMessagePrefix) {
		t.Errorf("Expected log message to contain \"%s\" but got log message: \"%s\"",
			expectedLogMessagePrefix, actualLogMessage)
	}

	//Cleanup
	channelDoShutDown <- 1
	<-channelWaitForShutDown
}

func TestDefaultAuthRepository_IsAuthorized_returns_error_when_authServer_respondsWith_errorStatusCode(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	dummyStatusCode := http.StatusForbidden
	dummyResponse := map[string]string{
		"message": "some error message",
	}
	expectedErrMessage := "some error message"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Verification failed: some error message"

	dummyVerifyAPIHandler := getDummyVerifyAPIHandler(t, dummyStatusCode, dummyResponse)
	startDummyAuthServer(dummyVerifyAPIHandler)

	//Act
	actualErr := authRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if actualErr == nil {
		t.Error("Expected error but got none")
	}
	if actualErr.Message != expectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", expectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}

	//Cleanup
	channelDoShutDown <- 1
	<-channelWaitForShutDown
}

func TestDefaultAuthRepository_IsAuthorized_returns_nil_when_authServer_respondsWith_200(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	dummyStatusCode := http.StatusOK
	dummyResponse := map[string]string{
		"message": "",
	}

	dummyVerifyAPIHandler := getDummyVerifyAPIHandler(t, dummyStatusCode, dummyResponse)
	startDummyAuthServer(dummyVerifyAPIHandler)

	//Act
	actualErr := authRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if actualErr != nil {
		t.Error("Expected no error but got error while testing successful case" + actualErr.Message)
	}

	//Cleanup
	channelDoShutDown <- 1
	<-channelWaitForShutDown
}

func Test_extractToken_returns_strippedToken_when_thereIs_bearerPrefix(t *testing.T) {
	//Arrange
	tokenString := "Bearer header.payload.signature"
	expected := "header.payload.signature"

	//Act
	actual := extractToken(tokenString)

	//Assert
	if actual != expected {
		t.Errorf("Expected extracted token to be \"%s\" but got \"%s\"", expected, actual)
	}
}

func Test_extractToken_returns_strippedToken_when_no_bearerPrefix(t *testing.T) {
	//Arrange
	tests := []struct {
		name        string
		tokenString string
	}{
		{"normal", "header.payload.signature"},
		{"leading space", " header.payload.signature"},
	}
	expected := "header.payload.signature"

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			//Act
			actual := extractToken(tc.tokenString)

			//Assert
			if actual != expected {
				t.Errorf("Expected extracted token to be \"%s\" but got \"%s\"", expected, actual)
			}
		})
	}
}

func Test_buildURL_returns_correctURL(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	expectedURLComponents := []string{
		fmt.Sprintf("token=%s", dummyToken),
		fmt.Sprintf("route_name=%s", dummyRouteName),
		fmt.Sprintf("account_id=%s", dummyRouteVars["account_id"]),
		fmt.Sprintf("customer_id=%s", dummyRouteVars["customer_id"]),
	}

	//Act
	actualURLString := buildURL(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	for _, v := range expectedURLComponents {
		if !strings.Contains(actualURLString, v) {
			t.Errorf("Expected url to contain %s but it did not", v)
		}
	}
}
