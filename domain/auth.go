package domain

import (
	"fmt"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

type Auth struct { //domain object
	Token     string
	RouteName string
	RouteVars map[string]string
	AuthURL   string
}

func (a *Auth) ExtractToken(tokenString string) (string, *errs.AppError) {
	if tokenString == "" {
		logger.Error("Client did not provide a token")
		return "", errs.NewAuthenticationError("No token was given")
	}
	if strings.Contains(tokenString, "Bearer ") { //Bearer <token>
		tokenString = strings.Split(tokenString, "Bearer ")[1] //<token>
	}
	return tokenString, nil
}

func (a *Auth) BuildURL() string {
	addr := os.Getenv("AUTH_SERVER_ADDRESS")
	port := os.Getenv("AUTH_SERVER_PORT")
	authURL, err := url.Parse(fmt.Sprintf("http://%s:%s/auth/verify", addr, port))
	if err != nil {
		logger.Fatal("Error while parsing verification URL") //hard to hit?
	}

	v := url.Values{}
	v.Add("token", a.Token)
	v.Add("route_name", a.RouteName)
	v.Add("account_id", a.RouteVars["account_id"])
	v.Add("customer_id", a.RouteVars["customer_id"])
	authURL.RawQuery = v.Encode()

	return authURL.String()
}

func (a *Auth) Send() *errs.AppError {
	response, err := http.Get(a.AuthURL)
	if err != nil {
		logger.Fatal("Error while sending request to verification URL: " + err.Error())
	}

	bytes, err := io.ReadAll(response.Body)
	if err != nil {
		logger.Error("Error while reading response from auth server")
		return errs.NewUnexpectedError("Unexpected authorization error")
	}
	if response.StatusCode != http.StatusOK {
		logger.Error("Request verification failed with status " + response.Status)
		return errs.NewAuthenticationError(string(bytes))
	}

	return nil
}
