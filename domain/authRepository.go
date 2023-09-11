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

	return result["is_authorized"].(bool)
}

func extractToken(tokenString string) string {
	if strings.Contains(tokenString, "Bearer ") { //Bearer <token>
		tokenString = strings.Split(tokenString, "Bearer ")[1] //<token>
	}
	return tokenString
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
