package app

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

func AuthMiddlewareHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//get token from request header, other info from request
		token := r.Header.Get("Authorization") //Authorization: Bearer <token>
		if token == "" {
			logger.Error("Client did not provide a token")
			newErr := errs.NewAuthenticationError("No token was given")
			writeJsonResponse(w, newErr.Code, newErr.AsMessage())
			return
		}
		if strings.Contains(token, "Bearer ") { //Bearer <token>
			token = strings.Split(token, "Bearer ")[1] //<token>
		}
		routeName := mux.CurrentRoute(r).GetName()
		routeVars := mux.Vars(r)

		//pass to banking-auth verify api: token, route name, vars in the route
		//a. build url
		addr := os.Getenv("AUTH_SERVER_ADDRESS")
		port := os.Getenv("AUTH_SERVER_PORT")
		authURL, err := url.Parse(fmt.Sprintf("http://%s:%s/auth/verify", addr, port))
		if err != nil {
			logger.Fatal("Error while parsing verification URL") //hard to hit?
		}

		v := url.Values{}
		v.Add("token", token)
		v.Add("route_name", routeName)
		v.Add("account_id", routeVars["account_id"])
		v.Add("customer_id", routeVars["customer_id"])
		authURL.RawQuery = v.Encode()

		//b. send request to url
		response, err := http.Get(authURL.String())
		if err != nil {
			logger.Fatal("Error while sending request to verification URL")
		}

		//read response to know if verification failed or can pass on to actual route handler
		bytes, err := io.ReadAll(response.Body)
		if err != nil {
			logger.Error("Error while reading response from auth server")
			newErr := errs.NewUnexpectedError("Unexpected error after authentication")
			writeJsonResponse(w, newErr.Code, newErr.AsMessage())
			return
		}
		if response.StatusCode != http.StatusOK {
			logger.Error("Verification failed")
			newErr := errs.NewAuthenticationError(string(bytes))
			writeJsonResponse(w, response.StatusCode, newErr.AsMessage()) //using the code from auth server instead
			return
		}

		next.ServeHTTP(w, r)
	})
}
