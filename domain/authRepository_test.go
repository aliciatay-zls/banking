package domain

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/udemy-go-1/banking-lib/logger"
	"log"
	"net/http"
	"os"
	"strings"
	"testing"
)

// Test variables
var dummyToken string
var dummyRouteName string
var dummyRouteVars map[string]string
var channelWaitForShutDown chan int
var channelDoShutDown chan int

func setupAuthRepositoryTest(t *testing.T) {
	if err := os.Setenv("AUTH_SERVER_ADDRESS", "localhost"); err != nil {
		t.Fatal("Error during testing: " + err.Error())
	}
	if err := os.Setenv("AUTH_SERVER_PORT", "8585"); err != nil {
		t.Fatal("Error during testing: " + err.Error())
	}

	dummyToken = "header.payload.signature"
	dummyRouteName = "SomeRouteName"
	dummyRouteVars = map[string]string{"account_id": "1977", "customer_id": "2"}

	logger.UnmuteLogger()
}

func getDummyVerifyAPIHandler(t *testing.T, dummyStatusCode int, dummyResponse interface{}) func(http.ResponseWriter, *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(dummyStatusCode)
		if err := json.NewEncoder(w).Encode(dummyResponse); err != nil {
			t.Error("Error during testing setup: " + err.Error())
		}
	}
}

func startDummyAuthServer(dummyVerifyAPIHandler func(http.ResponseWriter, *http.Request)) {
	address := os.Getenv("AUTH_SERVER_ADDRESS")
	port := os.Getenv("AUTH_SERVER_PORT")

	dummyAuthServer := http.Server{Addr: fmt.Sprintf("%s:%s", address, port)}

	channelWaitForShutDown = make(chan int) //sender
	channelDoShutDown = make(chan int, 1)   //receiver
	go func() {
		<-channelDoShutDown

		if err := dummyAuthServer.Shutdown(context.Background()); err != nil {
			log.Fatal("Error when shutting down dummy server: " + err.Error())
		}

		close(channelWaitForShutDown)
	}()

	http.HandleFunc("/auth/verify", dummyVerifyAPIHandler)

	go func() {
		if err := dummyAuthServer.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatal("Error while serving: " + err.Error())
		}
	}()
}

func TestAuthRepository_IsAuthorized_FalseWhenErrorSendingRequest(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	defaultAuthRepo := NewDefaultAuthRepository()
	//auth server is not started

	//Act
	isAuthorizationSuccess := defaultAuthRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if isAuthorizationSuccess != false {
		t.Error("Expected authorization to be false but got true")
	}
}

func TestAuthRepository_IsAuthorized_TrueWhenAuthServerReturnsAuthorized(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	defaultAuthRepo := NewDefaultAuthRepository()
	dummyStatusCode := http.StatusOK
	dummyResponse := map[string]interface{}{
		"is_authorized": true,
	}

	dummyVerifyAPIHandler := getDummyVerifyAPIHandler(t, dummyStatusCode, dummyResponse)
	startDummyAuthServer(dummyVerifyAPIHandler)
	//TODO: fix: subsequent tests that also call start the server fail when run all tests together as the /auth/verify route is registered multiple times concurrently by the multiple test threads

	//Act
	isAuthorizationSuccess := defaultAuthRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if isAuthorizationSuccess != dummyResponse["is_authorized"] {
		t.Errorf("Expected authorization to be %v but got %v", dummyResponse["is_authorized"], isAuthorizationSuccess)
	}

	//Cleanup
	channelDoShutDown <- 1
	<-channelWaitForShutDown
}

func TestAuthRepository_IsAuthorized_FalseWhenAuthServerReturnsUnauthorized(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	defaultAuthRepo := NewDefaultAuthRepository()
	dummyStatusCode := http.StatusUnauthorized
	dummyResponse := map[string]interface{}{
		"is_authorized": false,
		"message":       "this is bad",
	}

	dummyVerifyAPIHandler := getDummyVerifyAPIHandler(t, dummyStatusCode, dummyResponse)
	startDummyAuthServer(dummyVerifyAPIHandler)

	//Act
	isAuthorizationSuccess := defaultAuthRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if isAuthorizationSuccess != dummyResponse["is_authorized"] {
		t.Errorf("Expected authorization to be %v but got %v", dummyResponse["is_authorized"], isAuthorizationSuccess)
	}

	//Cleanup
	channelDoShutDown <- 1
	<-channelWaitForShutDown
}

// AuthServerReturnsUnexpectedResponseObjectType 1
func TestAuthRepository_IsAuthorized_FalseWhenErrorDecodingAuthServerResponse(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	defaultAuthRepo := NewDefaultAuthRepository()
	dummyStatusCode := http.StatusOK
	unexpectedResponse := "some string"

	dummyVerifyAPIHandler := getDummyVerifyAPIHandler(t, dummyStatusCode, unexpectedResponse)
	startDummyAuthServer(dummyVerifyAPIHandler)

	//Act
	isAuthorizationSuccess := defaultAuthRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if isAuthorizationSuccess != false {
		t.Error("Expected authorization to be false but got true")
	}

	//Cleanup
	channelDoShutDown <- 1
	<-channelWaitForShutDown
}

// AuthServerReturnsUnexpectedResponseObjectType 2
func TestAuthRepository_IsAuthorized_FalseWhenGettingAuthServerResponseValue_WrongValueType(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	defaultAuthRepo := NewDefaultAuthRepository()
	dummyStatusCode := http.StatusOK
	unexpectedResponses := map[string]interface{}{ //type assertion of string as bool type will fail
		"is_authorized": "some string",
	}

	dummyVerifyAPIHandler := getDummyVerifyAPIHandler(t, dummyStatusCode, unexpectedResponses)
	startDummyAuthServer(dummyVerifyAPIHandler)

	//Act
	isAuthorizationSuccess := defaultAuthRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if isAuthorizationSuccess != false {
		t.Error("Expected authorization to be false but got true")
	}

	//Cleanup
	channelDoShutDown <- 1
	<-channelWaitForShutDown
}

// AuthServerReturnsUnexpectedResponseObjectType 3
func TestAuthRepository_IsAuthorized_FalseWhenGettingAuthServerResponseValue_NoSuchKey(t *testing.T) {
	//Arrange
	setupAuthRepositoryTest(t)
	defaultAuthRepo := NewDefaultAuthRepository()
	dummyStatusCode := http.StatusOK
	unexpectedResponse := map[string]interface{}{ //type assertion of nil (no value gotten) as bool type will also fail
		"dummy_key": true,
	}

	dummyVerifyAPIHandler := getDummyVerifyAPIHandler(t, dummyStatusCode, unexpectedResponse)
	startDummyAuthServer(dummyVerifyAPIHandler)

	//Act
	isAuthorizationSuccess := defaultAuthRepo.IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars)

	//Assert
	if isAuthorizationSuccess != false {
		t.Error("Expected authorization to be false but got true")
	}

	//Cleanup
	channelDoShutDown <- 1
	<-channelWaitForShutDown
}

func TestAuthRepository_extractToken_StrippedTokenWhenThereIsBearerPrefix(t *testing.T) {
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

func TestAuthRepository_extractToken_StrippedTokenWhenNoBearerPrefix(t *testing.T) {
	//Arrange
	tokenStrings := []string{"header.payload.signature", " header.payload.signature"}
	expected := "header.payload.signature"

	for _, v := range tokenStrings {
		//Act
		actual := extractToken(v)

		//Assert
		if actual != expected {
			t.Errorf("Expected extracted token to be \"%s\" but got \"%s\"", expected, actual)
		}
	}
}

func TestAuthRepository_buildURL_CorrectURL(t *testing.T) {
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
