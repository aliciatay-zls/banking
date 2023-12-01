package domain

import (
	"database/sql"
	"errors"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/udemy-go-1/banking-lib/logger"
	"testing"
)

// Package common variables and inputs
var db *sql.DB
var mockDB sqlmock.Sqlmock

const driverName = "mysql"

// Test common variables and inputs
var cusRepoDb CustomerRepositoryDb
var customersTableColumns = []string{"customer_id", "name", "date_of_birth", "email", "country", "zipcode", "status"}

const dummyStatus = ""
const selectAllCustomersSql = "SELECT  customer_id, name, date_of_birth, email, country, zipcode, status FROM customers"
const selectSpecificCustomersSql = "SELECT  customer_id, name, date_of_birth, email, country, zipcode, status FROM customers WHERE status = ?"
const selectCustomersSql = "SELECT  customer_id, name, date_of_birth, email, country, zipcode, status FROM customers WHERE customer_id = ?"

func setupDB(t *testing.T) func() {
	var err error
	db, mockDB, err = sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatal("error while setting up test")
	}

	return func() {
		defer db.Close()
	}
}

func setupCustomerRepositoryDbTest(t *testing.T) func() {
	teardown := setupDB(t)
	cusRepoDb = NewCustomerRepositoryDb(sqlx.NewDb(db, driverName))
	return teardown
}

func TestCustomerRepositoryDb_FindAll_returns_error_when_selectCustomers_fails(t *testing.T) {
	//Arrange
	teardown := setupCustomerRepositoryDbTest(t)
	defer teardown()

	dummyDbErr := errors.New("some error message")
	mockDB.ExpectQuery(selectAllCustomersSql).WillReturnError(dummyDbErr)

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while querying/scanning customer table: " + dummyDbErr.Error()

	//Act
	_, err := cusRepoDb.FindAll(dummyStatus)

	//Assert
	if err == nil {
		t.Fatal("Expected error but got none while testing failed select to find all customers")
	}
	if err.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, err.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0]
	if actualLogMessage.Message != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
	}
}

func TestCustomerRepositoryDb_FindAll_returns_all_customers_when_selectCustomers_succeed_and_status_empty(t *testing.T) {
	//Arrange
	teardown := setupCustomerRepositoryDbTest(t)
	defer teardown()

	dummyCustomers := getDefaultCustomers()
	dummyRows := sqlmock.NewRows(customersTableColumns)
	for _, v := range dummyCustomers {
		dummyRows.AddRow(v.Id, v.Name, v.DateOfBirth, v.Email, v.Country, v.Zipcode, v.Status)
	}
	mockDB.ExpectQuery(selectAllCustomersSql).WillReturnRows(dummyRows)

	//Act
	actualCustomers, err := cusRepoDb.FindAll(dummyStatus)

	//Assert
	if err != nil {
		t.Errorf("Expected no error but got error while testing finding all customers successfully: " + err.Message)
	}
	if len(actualCustomers) != len(dummyCustomers) {
		t.Fatalf("Expected %d customers to be returned but got %d customers", len(dummyCustomers), len(actualCustomers))
	}
	for k, v := range dummyCustomers {
		if actualCustomers[k] != v {
			t.Errorf("Expected customer %v but got %v", v, actualCustomers[k])
		}
	}
}

func TestCustomerRepositoryDb_FindAll_returns_specific_customers_when_selectCustomers_succeed_and_status_nonEmpty(t *testing.T) {
	//Arrange
	teardown := setupCustomerRepositoryDbTest(t)
	defer teardown()

	dummyActiveCustomer := getDefaultCustomers()[0]
	dummyRows := sqlmock.NewRows(customersTableColumns).
		AddRow(dummyActiveCustomer.Id, dummyActiveCustomer.Name, dummyActiveCustomer.DateOfBirth, dummyActiveCustomer.Email, dummyActiveCustomer.Country, dummyActiveCustomer.Zipcode, dummyActiveCustomer.Status)
	mockDB.ExpectQuery(selectSpecificCustomersSql).
		WithArgs("1").
		WillReturnRows(dummyRows)

	//Act
	actualCustomers, err := cusRepoDb.FindAll("1")

	//Assert
	if err != nil {
		t.Errorf("Expected no error but got error while testing finding all customers successfully: " + err.Message)
	}
	if len(actualCustomers) != 1 {
		t.Fatalf("Expected 1 active customer to be returned but got %d customers", len(actualCustomers))
	}
	if actualCustomers[0] != dummyActiveCustomer {
		t.Errorf("Expected customer %v but got %v", dummyActiveCustomer, actualCustomers[0])
	}
}

func TestCustomerRepositoryDb_FindById_returns_error_when_selectCustomers_fails(t *testing.T) {
	//Arrange
	tests := []struct {
		name               string
		dummyCustomerId    string
		dummyErr           error
		expectedErrMessage string
	}{
		{"due to nonexistent customer", "321", sql.ErrNoRows, "Customer not found"},
		{"due to other DB error", dummyCustomerId, errors.New("some error message"), defaultExpectedErrMessage},
	}

	teardown := setupCustomerRepositoryDbTest(t)
	defer teardown()

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockDB.ExpectQuery(selectCustomersSql).
				WithArgs(tc.dummyCustomerId).
				WillReturnError(tc.dummyErr)

			logs := logger.ReplaceWithTestLogger()
			expectedLogMessage := "Error while querying/scanning customer: " + tc.dummyErr.Error()

			//Act
			_, actualErr := cusRepoDb.FindById(tc.dummyCustomerId)

			//Assert
			if actualErr == nil {
				t.Fatal("Expected error but got none while testing failed insertion of account")
			}
			if actualErr.Message != tc.expectedErrMessage {
				t.Errorf("Expected error message to be \"%s\" but got \"%s\"", tc.expectedErrMessage, actualErr.Message)
			}
			if logs.Len() != 1 {
				t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
			}
			actualLogMessage := logs.All()[0]
			if actualLogMessage.Message != expectedLogMessage {
				t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
			}
		})
	}
}

func TestCustomerRepositoryDb_FindById_returns_customer_when_selectCustomers_succeeds(t *testing.T) {
	//Arrange
	teardown := setupCustomerRepositoryDbTest(t)
	defer teardown()

	dummyCustomer := getDefaultCustomers()[1]
	dummyRows := sqlmock.NewRows(customersTableColumns).
		AddRow(dummyCustomer.Id, dummyCustomer.Name, dummyCustomer.DateOfBirth, dummyCustomer.Email, dummyCustomer.Country, dummyCustomer.Zipcode, dummyCustomer.Status)
	mockDB.ExpectQuery(selectCustomersSql).
		WithArgs(dummyCustomer.Id).
		WillReturnRows(dummyRows)

	//Act
	actualCustomer, err := cusRepoDb.FindById(dummyCustomer.Id)

	//Assert
	if err != nil {
		t.Fatal("Expected no error but got error while testing finding all customers successfully: " + err.Message)
	}
	if *actualCustomer != dummyCustomer {
		t.Errorf("Expected customer %v but got %v", dummyCustomer, *actualCustomer)
	}
}
