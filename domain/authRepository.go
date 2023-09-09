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

type DefaultAuthRepository struct { //business/domain object

}

func NewDefaultAuthRepository() DefaultAuthRepository {
	return DefaultAuthRepository{}
}

func (r DefaultAuthRepository) IsAuthorized(tokenString string, routeName string, routeVars map[string]string) bool {
	token := extractToken(tokenString)

	authURL := buildURL(token, routeName, routeVars)

	response, err := http.Get(authURL)
	if err != nil {
		logger.Error("Error while sending request to verification URL: " + err.Error())
		return false
	}

	result := map[string]bool{}
	if err = json.NewDecoder(response.Body).Decode(&result); err != nil {
		logger.Error("Error while reading response from auth server")
		return false
	}
	if response.StatusCode != http.StatusOK {
		logger.Error("Request verification failed with status " + response.Status)
		return false
	}

	return result["isAuthorized"]
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
	authURL := url.URL{
		Scheme: "http",
		Host:   fmt.Sprintf("%s:%s", addr, port),
		Path:   "auth/verify",
	}

	v := url.Values{}
	v.Add("token", token)
	v.Add("route_name", routeName)
	v.Add("account_id", routeVars["account_id"])
	v.Add("customer_id", routeVars["customer_id"])
	authURL.RawQuery = v.Encode()

	return authURL.String()
}

//authRepository.go is a repo but follows usual code for a service (primary port) instead of usual code for a repo:
//port, "Default*" domain object, "New*()" constructor, make domain object implement port
