package app

import (
	"github.com/gorilla/mux"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/backend/domain"
	"net/http"
)

type AuthMiddleware struct {
	repo domain.AuthRepository //middleware handler has dependency on repo (server side) directly, skipped service
}

// AuthMiddlewareHandler is a middleware that retrieves the token, route name and any vars in the route from the
// client's request to build a URL to the auth server's verify api. It then sends a request to the URL and if
// verification is successful, passes the client's request down to the actual route handler.
func (m AuthMiddleware) AuthMiddlewareHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		//handle preflight requests
		enableCORS(w)
		if r.Method == http.MethodOptions {
			writeJsonResponse(w, http.StatusOK, errs.NewMessageObject("all preflight requests currently accepted"))
			return
		}

		//handle actual request
		tokenString := r.Header.Get("Authorization")
		if tokenString == "" {
			logger.Error("Client did not provide a token")
			writeJsonResponse(w, http.StatusUnauthorized, errs.NewMessageObject(errs.MessageMissingToken))
			return
		}
		routeName := mux.CurrentRoute(r).GetName()
		routeVars := mux.Vars(r)

		if appErr := m.repo.IsAuthorized(tokenString, routeName, routeVars); appErr != nil {
			writeJsonResponse(w, appErr.Code, appErr.AsMessage())
			return
		}

		next.ServeHTTP(w, r)
	})
}

func enableCORS(w http.ResponseWriter) {
	w.Header().Add("Access-Control-Allow-Origin", "https://localhost:3000") //frontend domain
	w.Header().Add("Access-Control-Allow-Methods", "POST, GET, OPTIONS")    //OPTIONS: preflight request method
	w.Header().Add("Access-Control-Allow-Headers", "Content-Type, Authorization")
}
