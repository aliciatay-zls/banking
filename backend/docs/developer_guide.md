# Developer Guide

## Architecture

The app architecture follows the [OAuth 2.0 framework](https://www.oauth.com/oauth2-servers/the-resource-server/). 

The backend comprises 2 servers: the resource server and the [authentication/authorisation server](https://github.com/aliciatay-zls/banking-auth). 

The resource server serves and has access to customer resources that are not needed for auth (such as bank accounts and 
transactions). The auth server provides security mechanisms like token management and role-based access control and 
therefore has access to login credentials, refresh tokens and other data needed for auth.

The frontend consists of the frontend server.

To perform a CRUD (Create/Read/Update/Delete) operation on a customer resource, the resource server requires an access 
token to be included in the request so that the auth server can use it to verify if the request is valid and 
authorised. Hence, the frontend server sends a request to the resource server, which in turn sends a request to the 
auth server to verify the frontend's request. If successful, the resource server proceeds to perform the operation 
(for example send the requested customer resource to the frontend in a Read operation).

To fulfil logins or logouts, get a new access token, or check if the client is already logged in, the frontend server 
sends a request to the auth server directly.

During development, there is also a mail server (in the form of MailHog, which also acts as the client).

### Production

* [Vercel](https://vercel.com/): frontend code deployed here
* [Render](https://render.com/): backend code (resource server, auth server) deployed here
  * As publicly accessible web services
* [Aiven](https://aiven.io/): database hosted here
* Gmail SMTP: acts as remote mail server

### Development

* React/Next.js frontend app
  * Served on: `localhost:3000`
  * Key dependencies: react, react-dom, next, [cookie](https://www.npmjs.com/package/cookie?activeTab=readme), [react-cookie](https://www.npmjs.com/package/react-cookie?activeTab=readme)
* Go backend resource server
  * Served on: `localhost:8080`
  * Dependency: [custom Go library](https://github.com/aliciatay-zls/banking-lib)
* Go backend auth server
  * Served on: `localhost:8181`
  * Dependency: [custom Go library](https://github.com/aliciatay-zls/banking-lib)
* MySQL database server started up in a Docker container
  * Served on: `localhost:3306`
* MailHog client/server
  * Served on: `localhost:8025`

## Development Docs

### Setup

1. Install Go
    * Uninstall previous Go (if any): https://go.dev/doc/manage-install under section “Uninstalling Go”
    * Download installer for newest Go version and follow steps to install: https://go.dev/doc/install

2. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

3. Configure environment variables.
    * Development:
      * Backend: set values in the scripts in `backend/scripts/` if not using the dummy values
      * Frontend: set values in the `frontend/.env.development` file if not using the dummy values
    * Production:
      * Backend: create a `backend/.env` file with the same keys as the scripts in `backend/scripts/`
      * Frontend: create a `frontend/.env.production` file with the same keys as `frontend/.env.development`

4. Install or upgrade current version of Node.js and npm using the [Node.js installer](https://nodejs.org/en/download)

5. Clone this repo.

### Running the App

1. Start Docker Desktop.

2. To start the database, backend resource and frontend servers:
   ```
   make -j3 dev
   ```
   In separate terminal tab, view logs for all three in real-time without them interleaving:
   ```
    tail -f backend/db.log backend/backend.log frontend/frontend.log
   ```
   On success, logs printed:
    * Database: will end with `"ready for connections"`
    * Backend resource server: will be an info-level log with the message `"Starting the app..."`
    * Frontend server: will end with `"Ready in xx.xx s"`

3. To start the backend auth server, see other [repo](https://github.com/aliciatay-zls/banking-auth)

4. Navigate to https://localhost:3000/login to view the app.

5. Alternatively, [Postman](https://www.postman.com/) can be used to directly send requests to the backend resource
   server API. See [backend docs](README.md) for more details.

6. To check changes made to the app database, open another tab in terminal and start an interactive shell in
   the container for querying the db:
   ```
   docker exec -it mysql sh
   # mysql -u root -p
   Enter password: (enter password "codecamp")
   mysql> show databases;
   mysql> use banking;
   mysql> show tables;
   mysql> select * from accounts;
   ```

7. Run all unit tests each time changes have been made to the backend:
   ```
   cd backend
   go test -v ./...
   ```

8. Update all packages periodically to the latest version:
    * Backend:
   ```
   go get -u all
   go mod tidy
   ```
    * Frontend:
   ```
   npm i next@latest react@latest react-dom@latest
   ```
