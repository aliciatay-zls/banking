package app

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
)

func AuthMiddlewareHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//get token from request header, other info from request
		token := r.Header.Get("Authorization")
		if token == "" {
			logger.Error("Client did not provide a token")
			newErr := errs.NewAuthenticationError("No token was given")
			writeJsonResponse(w, newErr.Code, newErr.AsMessage())
			return
		}
		routeName := mux.CurrentRoute(r).GetName()
		routeVars := mux.Vars(r)

		log.Println(token)
		log.Println(routeName)
		log.Println(routeVars)

		//pass to banking-auth verify api: token, route name, vars in the route
		//a. build url
		addr := os.Getenv("AUTH_SERVER_ADDRESS")
		port := os.Getenv("AUTH_SERVER_PORT")
		authURL, err := url.Parse(fmt.Sprintf("http://%s:%s/auth/verify", addr, port))
		if err != nil {
			logger.Fatal("Error while parsing verification URL") //hard to hit?
		}
		q := authURL.Query()
		q.Set("token", token)
		q.Set("route_name", routeName)
		routeVarsString := ""
		for _, v := range routeVars {
			routeVarsString += v
		}
		q.Set("route_vars", routeVarsString)
		authURL.RawQuery = q.Encode()

		log.Println(authURL)

		//b. send request to url
		response, err := http.Get(authURL.String())
		if err != nil {
			logger.Fatal("Error while sending request to verification URL")
		}
		if response.StatusCode != http.StatusOK {
			logger.Error("Verification request rejected with status " + response.Status)
			return
		}
		bytes, err := io.ReadAll(response.Body)
		if err != nil {
			logger.Error("Error while reading response from auth server")
			return
		}
		log.Printf("%s\n", bytes)

		next.ServeHTTP(w, r)
	})
}
