package domain

import (
	"encoding/json"
	"fmt"
	"github.com/aliciatay-zls/banking-lib/errs"
	"github.com/aliciatay-zls/banking-lib/logger"
	"net/http"
	"net/url"
	"os"
	"strings"
)

const AuthorizationHeaderPrefix = "Bearer "

//go:generate mockgen -destination=../mocks/domain/mock_authRepository.go -package=domain github.com/aliciatay-zls/banking/backend/domain AuthRepository
type AuthRepository interface { //repo (secondary port)
	IsAuthorized(string, string, map[string]string) *errs.AppError
}

type DefaultAuthRepository struct { //adapter

}

func NewDefaultAuthRepository() DefaultAuthRepository {
	return DefaultAuthRepository{}
}

func (r DefaultAuthRepository) IsAuthorized(tokenString string, routeName string, routeVars map[string]string) *errs.AppError { //adapter implements repo
	token := extractToken(tokenString)

	verifyURL := buildURL(token, routeName, routeVars)

	response, err := http.Get(verifyURL)
	if err != nil {
		logger.Error("Error while sending request to verification URL: " + err.Error())
		return errs.NewUnexpectedError("Internal server error")
	}
	if response.StatusCode != http.StatusOK {
		responseData := map[string]string{}
		if err = json.NewDecoder(response.Body).Decode(&responseData); err != nil {
			logger.Error("Error while reading response from auth server: " + err.Error())
			return errs.NewUnexpectedError("Internal server error")
		}

		logger.Error("Verification failed: " + responseData["message"])
		return errs.NewAppError(response.StatusCode, responseData["message"])
	}

	return nil
}

// extractToken converts the value of the Authorization header from the form "Bearer <token>" to "<token>"
func extractToken(tokenString string) string {
	if strings.Contains(tokenString, AuthorizationHeaderPrefix) {
		tokenString = strings.Split(tokenString, AuthorizationHeaderPrefix)[1]
	}
	return strings.TrimSpace(tokenString)
}

func buildURL(token string, routeName string, routeVars map[string]string) string {
	addr := os.Getenv("AUTH_SERVER_ADDRESS")
	port := os.Getenv("AUTH_SERVER_PORT")
	verifyURL := url.URL{
		Scheme: "https",
		Host:   fmt.Sprintf("%s:%s", addr, port),
		Path:   "auth/verify",
	}

	v := url.Values{}
	v.Add("token", token)
	v.Add("route_name", routeName)
	v.Add("account_id", routeVars["account_id"])
	v.Add("customer_id", routeVars["customer_id"])
	verifyURL.RawQuery = v.Encode()

	return verifyURL.String()
}

//repo (port) + adapter all in one source file, not separate (DefaultAuthRepository would usually be AuthRepositoryDb)
//authRepository.go is a repo but similar code as a service (primary port) instead of usual code for a repo:
//here   : port, "Default*" adapter, "New*()" constructor, make adapter implement port
//service: port, "Default*" domain object, "New*()" constructor, make domain object implement port
