package domain

import (
	"encoding/json"
	"fmt"
	"github.com/udemy-go-1/banking-lib/logger"
	"net/http"
	"net/url"
	"os"
	"strings"
)

//go:generate mockgen -destination=../mocks/domain/mock_authRepository.go -package=domain github.com/udemy-go-1/banking/backend/domain AuthRepository
type AuthRepository interface { //repo (secondary port)
	IsAuthorized(string, string, map[string]string) bool
}

type DefaultAuthRepository struct { //adapter

}

func NewDefaultAuthRepository() DefaultAuthRepository {
	return DefaultAuthRepository{}
}

func (r DefaultAuthRepository) IsAuthorized(tokenString string, routeName string, routeVars map[string]string) bool { //adapter implements repo
	token := extractToken(tokenString)

	verifyURL := buildURL(token, routeName, routeVars)

	response, err := http.Get(verifyURL)
	if err != nil {
		logger.Error("Error while sending request to verification URL: " + err.Error())
		return false
	}

	result := map[string]interface{}{}
	if err = json.NewDecoder(response.Body).Decode(&result); err != nil {
		logger.Error("Error while reading response from auth server: " + err.Error())
		return false
	}
	if response.StatusCode != http.StatusOK {
		logger.Error("Request verification failed: " + result["message"].(string))
		return false
	}

	val, ok := result["is_authorized"].(bool)
	if !ok {
		logger.Error("Error while getting value of the `is_authorized` key: value is not of type bool")
		return false
	}
	return val
}

// extractToken converts the value of the Authorization header from the form "Bearer <token>" to "<token>"
func extractToken(tokenString string) string {
	if strings.Contains(tokenString, "Bearer ") {
		tokenString = strings.Split(tokenString, "Bearer ")[1]
	}
	return strings.TrimSpace(tokenString)
}

func buildURL(token string, routeName string, routeVars map[string]string) string {
	addr := os.Getenv("AUTH_SERVER_ADDRESS")
	port := os.Getenv("AUTH_SERVER_PORT")
	verifyURL := url.URL{
		Scheme: "http",
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
