package app

import (
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking/domain"
	"net/http"
)

// AuthMiddlewareHandler is a middleware that retrieves the token, route name and any vars in the route from the
// client's request to build a URL to the auth server's verify api. It then sends a request to the URL and if
// verification is successful, passes the client's request down to the actual route handler.
func AuthMiddlewareHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var auth domain.Auth
		token, err := auth.ExtractToken(r.Header.Get("Authorization"))
		if err != nil {
			writeJsonResponse(w, err.Code, err.AsMessage())
			return
		}
		auth.Token = token
		auth.RouteName = mux.CurrentRoute(r).GetName()
		auth.RouteVars = mux.Vars(r)
		auth.AuthURL = auth.BuildURL()

		err = auth.Send()
		if err != nil {
			writeJsonResponse(w, err.Code, err.AsMessage())
			return
		}

		next.ServeHTTP(w, r)
	})
}
