package app

import (
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking/mocks/domain"
	"go.uber.org/mock/gomock"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Test variables
var mockAuthRepo *domain.MockAuthRepository
var amw AuthMiddleware

func setupAuthMiddlewareTest(t *testing.T, hasTokenHeader bool) func() {
	router = mux.NewRouter()

	ctrl := gomock.NewController(t)
	mockAuthRepo = domain.NewMockAuthRepository(ctrl)
	amw = AuthMiddleware{mockAuthRepo}

	dummyToken, dummyRouteName, _, dummyStatusCode, dummyResponse := getAuthMiddlewareHandlerDefaultDummyInputs()
	dummyHandler := func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Content-Type", "application/text")
		w.WriteHeader(dummyStatusCode)
		if _, err := w.Write([]byte(dummyResponse)); err != nil {
			t.Error("Error during testing setup: " + err.Error())
		}
	}
	router.HandleFunc("/some/path", dummyHandler).Name(dummyRouteName)
	router.Use(amw.AuthMiddlewareHandler)

	recorder = httptest.NewRecorder()
	request = httptest.NewRequest(http.MethodGet, "/some/path", nil)
	if hasTokenHeader {
		request.Header.Add("Authorization", dummyToken)
	}

	return func() {
		router = nil
		recorder = nil
		request = nil
		defer ctrl.Finish()
	}
}

func getAuthMiddlewareHandlerDefaultDummyInputs() (string, string, map[string]string, int, string) {
	dummyToken := "header.payload.signature"
	dummyRouteName := "SomeRoute"
	dummyRouteVars := map[string]string{}
	dummyStatusCode := http.StatusContinue
	dummyMessage := "Entered next handler"
	return dummyToken, dummyRouteName, dummyRouteVars, dummyStatusCode, dummyMessage
}

func TestAuthMiddleware_AuthMiddlewareHandler_ErrorStatusCodeWhenTokenMissing(t *testing.T) {
	//Arrange
	teardownAll := setupAuthMiddlewareTest(t, false)
	defer teardownAll()

	expectedStatusCode := http.StatusUnauthorized
	expectedMessage := "Missing token"

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

func TestAuthMiddleware_AuthMiddlewareHandler_RunsNextHandlerFuncWhenRepoSucceeds(t *testing.T) {
	//Arrange
	teardownAll := setupAuthMiddlewareTest(t, true)
	defer teardownAll()

	dummyToken, dummyRouteName, _, dummyStatusCode, dummyMessage := getAuthMiddlewareHandlerDefaultDummyInputs()
	mockAuthRepo.EXPECT().IsAuthorized(dummyToken, dummyRouteName, map[string]string{}).Return(true)

	//Act
	router.ServeHTTP(recorder, request)

	//Assert
	if recorder.Result().StatusCode != dummyStatusCode {
		t.Errorf("Expected status code %d but got %d", dummyStatusCode, recorder.Result().StatusCode)
	}
	actualResponse, _ := io.ReadAll(recorder.Result().Body)
	if !strings.Contains(string(actualResponse), dummyMessage) {
		t.Errorf("Expecting response to contain %s but got %s", dummyMessage, actualResponse)
	}
}

func TestAuthMiddleware_AuthMiddlewareHandler_ErrorStatusCodeWhenRepoFails(t *testing.T) {
	//Arrange
	teardownAll := setupAuthMiddlewareTest(t, true)
	defer teardownAll()

	dummyToken, dummyRouteName, dummyRouteVars, _, _ := getAuthMiddlewareHandlerDefaultDummyInputs()
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
