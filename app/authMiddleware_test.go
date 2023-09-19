package app

import (
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/mocks/domain"
	"go.uber.org/mock/gomock"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Test variables and common inputs
var mockAuthRepo *domain.MockAuthRepository
var amw AuthMiddleware
var dummyRouteVars map[string]string

const dummyPath = "/some/path"
const dummyToken = "header.payload.signature"
const dummyRouteName = "SomeRoute"
const dummyStatusCodeFromHandler = http.StatusContinue
const dummyResponseMessage = "Entered next handler"

func setupAuthMiddlewareTest(t *testing.T, isTokenGiven bool) func() {
	router = mux.NewRouter()

	ctrl := gomock.NewController(t)
	mockAuthRepo = domain.NewMockAuthRepository(ctrl)
	amw = AuthMiddleware{mockAuthRepo}

	dummyRouteVars = map[string]string{}

	dummyHandler := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/text")
		w.WriteHeader(dummyStatusCodeFromHandler)
		if _, err := w.Write([]byte(dummyResponseMessage)); err != nil {
			t.Fatal("Error during testing setup: " + err.Error())
		}
	}
	router.HandleFunc(dummyPath, dummyHandler).Name(dummyRouteName)
	router.Use(amw.AuthMiddlewareHandler)

	recorder = httptest.NewRecorder()
	request = httptest.NewRequest(http.MethodGet, dummyPath, nil)
	if isTokenGiven {
		request.Header.Add("Authorization", dummyToken)
	}

	return func() {
		router = nil
		recorder = nil
		request = nil
		defer ctrl.Finish()
	}
}

func TestAuthMiddleware_AuthMiddlewareHandler_ErrorStatusCodeWhenTokenMissing(t *testing.T) {
	//Arrange
	teardownAll := setupAuthMiddlewareTest(t, false)
	defer teardownAll()

	expectedStatusCode := http.StatusUnauthorized
	expectedMessage := "Missing token"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Client did not provide a token"

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != expectedStatusCode {
		t.Errorf("Expected status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), expectedMessage) {
		t.Errorf("Expecting response to contain %s but got %s", expectedMessage, actualResponse)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}

func TestAuthMiddleware_AuthMiddlewareHandler_RunsNextHandlerFuncWhenRepoSucceeds(t *testing.T) {
	//Arrange
	teardownAll := setupAuthMiddlewareTest(t, true)
	defer teardownAll()

	mockAuthRepo.EXPECT().IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars).Return(true)

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != dummyStatusCodeFromHandler {
		t.Errorf("Expected status code %d but got %d", dummyStatusCodeFromHandler, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), dummyResponseMessage) {
		t.Errorf("Expecting response to contain %s but got %s", dummyResponseMessage, actualResponse)
	}
}

func TestAuthMiddleware_AuthMiddlewareHandler_ErrorStatusCodeWhenRepoFails(t *testing.T) {
	//Arrange
	teardownAll := setupAuthMiddlewareTest(t, true)
	defer teardownAll()

	mockAuthRepo.EXPECT().IsAuthorized(dummyToken, dummyRouteName, dummyRouteVars).Return(false)
	expectedStatusCode := http.StatusForbidden
	expectedMessage := "Access forbidden"

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != expectedStatusCode {
		t.Errorf("Expected status code %d but got %d", expectedStatusCode, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), expectedMessage) {
		t.Errorf("Expecting response to contain %s but got %s", expectedMessage, actualResponse)
	}
}

//mux.Router: It implements the http.Handler interface, so it can be registered to serve requests
