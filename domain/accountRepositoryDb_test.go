package domain

import (
	"database/sql"
	"errors"
	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jmoiron/sqlx"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/dto"
	"testing"
)

// Test common variables and inputs
var mockDB sqlmock.Sqlmock
var accRepoDb AccountRepositoryDb

const dummyDate = "2006-01-02 15:04:05"
const dummyAmount float64 = 6000

const dummyAccountType = dto.AccountTypeSaving
const dummyAccountIdAsInt int64 = 1977
const defaultExpectedErrMessage = "Unexpected database error"

const dummyTransactionType = dto.TransactionTypeDeposit
const dummyTransactionId = "7791"
const dummyTransactionIdAsInt int64 = 7791
const dummyBalance float64 = 12000
const dummyBalanceAfterWithdrawal float64 = 0

const insertAccountsSql = "INSERT INTO accounts (customer_id, opening_date, account_type, amount, status) VALUES (?, ?, ?, ?, ?)"
const selectAccountsSql = "SELECT * FROM accounts WHERE account_id = ?"
const updateAccountsDepositSql = "UPDATE accounts SET amount = amount + ? WHERE account_id = ?"
const updateAccountsWithdrawalSql = "UPDATE accounts SET amount = amount - ? WHERE account_id = ?"
const insertTransactionsSql = "INSERT INTO transactions (account_id, amount, transaction_type, transaction_date) VALUES (?, ?, ?, ?)"

func setupAccountRepoDbTest(t *testing.T) func() {
	var db *sql.DB
	var err error
	db, mockDB, err = sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatal("Error during test setup: creating mock db")
	}

	sqlxDb := sqlx.NewDb(db, "mysql")
	accRepoDb = NewAccountRepositoryDb(sqlxDb)

	return func() {
		defer db.Close()
	}
}

func getDefaultAccountBeforeSave() Account {
	return Account{
		CustomerId:  dummyCustomerId,
		OpeningDate: dummyDate,
		AccountType: dummyAccountType,
		Amount:      dummyAmount,
		Status:      "1",
	}
}

func getDefaultAccountAfterSave() Account {
	newAccount := getDefaultAccountBeforeSave()
	newAccount.AccountId = dummyAccountId
	return newAccount
}

func getDefaultTransactionBeforeTransact() Transaction {
	return Transaction{
		AccountId:       dummyAccountId,
		Amount:          dummyAmount,
		TransactionType: dummyTransactionType,
		TransactionDate: dummyDate,
	}
}

func getDefaultTransactionAfterTransact() Transaction {
	newTransaction := getDefaultTransactionBeforeTransact()
	newTransaction.TransactionId = dummyTransactionId
	newTransaction.Balance = dummyBalance
	return newTransaction
}

func Test_Save_returns_error_when_insertion_fails(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	dummyAccount := getDefaultAccountBeforeSave()
	dummyDbErr := errors.New("not connected to database yet")
	mockDB.ExpectExec(insertAccountsSql).
		WithArgs(dummyAccount.CustomerId, dummyAccount.OpeningDate, dummyAccount.AccountType, dummyAccount.Amount, dummyAccount.Status).
		WillReturnError(dummyDbErr)

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while creating new account: " + dummyDbErr.Error()

	//Act
	_, actualErr := accRepoDb.Save(dummyAccount)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing failed insertion of account")
	}
	if actualErr.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0]
	if actualLogMessage.Message != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
	}
}

func Test_Save_returns_error_when_gettingInsertId_fails(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	dummyAccount := getDefaultAccountBeforeSave()
	dummyErr := errors.New("some error message")
	dummyErrorResult := sqlmock.NewErrorResult(dummyErr)
	mockDB.ExpectExec(insertAccountsSql).
		WithArgs(dummyAccount.CustomerId, dummyAccount.OpeningDate, dummyAccount.AccountType, dummyAccount.Amount, dummyAccount.Status).
		WillReturnResult(dummyErrorResult)

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while getting id of newly inserted account: " + dummyErr.Error()

	//Act
	_, actualErr := accRepoDb.Save(dummyAccount)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing failure getting insert ID")
	}
	if actualErr.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0]
	if actualLogMessage.Message != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
	}
}

func Test_Save_returns_newAccount_when_insertion_and_getInsertionId_succeed(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	dummyAccount := getDefaultAccountBeforeSave()
	var lastInsertID int64 = dummyAccountIdAsInt
	var rowsAffected int64 = 1
	dummyResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(insertAccountsSql).
		WithArgs(dummyAccount.CustomerId, dummyAccount.OpeningDate, dummyAccount.AccountType, dummyAccount.Amount, dummyAccount.Status).
		WillReturnResult(dummyResult)

	expectedNewAccount := getDefaultAccountAfterSave()

	//Act
	actualNewAccount, err := accRepoDb.Save(dummyAccount)

	//Assert
	if err != nil {
		t.Fatal("Expected no error but got error while testing successful saving of account: " + err.Message)
	}
	if *actualNewAccount != expectedNewAccount {
		t.Errorf("Expected account %v but got account %v", expectedNewAccount, *actualNewAccount)
	}
}

func Test_FindById_returns_error_when_select_fails(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	tests := []struct {
		name               string
		dummyDbErr         error
		dummyAccountId     string
		expectedErrMessage string
	}{
		{"due to nonexistent account", sql.ErrNoRows, "321", "Account not found"},
		{"due to other db error", errors.New("some error message"), dummyAccountId, defaultExpectedErrMessage},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mockDB.ExpectQuery(selectAccountsSql).
				WithArgs(tc.dummyAccountId).
				WillReturnError(tc.dummyDbErr)

			logs := logger.ReplaceWithTestLogger()
			expectedLogMessage := "Error while retrieving account: " + tc.dummyDbErr.Error()

			//Act
			_, err := accRepoDb.FindById(tc.dummyAccountId)

			//Assert
			if err == nil {
				t.Fatal("Expected error but got none while testing failed select")
			}
			if err.Message != tc.expectedErrMessage {
				t.Errorf("Expected error message to be \"%s\" but got \"%s\"",
					tc.expectedErrMessage, err.Message)
			}
			if logs.Len() != 1 {
				t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
			}
			actualLogMessage := logs.All()[0]
			if actualLogMessage.Message != expectedLogMessage {
				t.Errorf("Expected log message to be \"%s\" but got \"%s\"",
					expectedLogMessage, actualLogMessage.Message)
			}
		})
	}
}

func Test_FindById_returns_account_when_select_succeeds(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	dummyNewAccount := getDefaultAccountAfterSave()
	columns := []string{"account_id", "customer_id", "opening_date", "account_type", "amount", "status"}
	dummyRows := sqlmock.NewRows(columns).
		AddRow(dummyNewAccount.AccountId, dummyNewAccount.CustomerId, dummyNewAccount.OpeningDate, dummyNewAccount.AccountType, dummyNewAccount.Amount, dummyNewAccount.Status)
	mockDB.ExpectQuery(selectAccountsSql).
		WithArgs(dummyNewAccount.AccountId).
		WillReturnRows(dummyRows)

	//Act
	actualAccount, err := accRepoDb.FindById(dummyNewAccount.AccountId)

	//Assert
	if err != nil {
		t.Fatal("Expected no error but got error while testing successful select: " + err.Message)
	}
	if *actualAccount != dummyNewAccount {
		t.Errorf("Expected account %v but got %v", dummyNewAccount, *actualAccount)
	}
}

func Test_Transact_returns_error_when_failure_startingDbTransaction(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	dummyTransaction := getDefaultTransactionBeforeTransact()
	dummyErr := errors.New("some error message")
	mockDB.ExpectBegin().WillReturnError(dummyErr)

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while starting db transaction for making transaction in bank account: " + dummyErr.Error()

	//Act
	_, actualErr := accRepoDb.Transact(dummyTransaction)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing failed starting of db transaction")
	}
	if actualErr.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0]
	if actualLogMessage.Message != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
	}
}

func Test_Transact_returns_error_when_update_fails(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	mockDB.ExpectBegin()

	dummyTransaction := getDefaultTransactionBeforeTransact()
	dummyDbErr := errors.New("some error message")
	mockDB.ExpectExec(updateAccountsDepositSql).
		WithArgs(dummyTransaction.Amount, dummyTransaction.AccountId).
		WillReturnError(dummyDbErr)

	mockDB.ExpectRollback()

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while updating account: " + dummyDbErr.Error()

	//Act
	_, actualErr := accRepoDb.Transact(dummyTransaction)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing failed updating of account")
	}
	if actualErr.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0]
	if actualLogMessage.Message != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
	}
	if err := mockDB.ExpectationsWereMet(); err != nil { //TODO: need?
		t.Errorf("Unmet expectation error: " + err.Error())
	}
}

func Test_Transact_returns_error_when_insert_fails(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	mockDB.ExpectBegin()

	dummyTransaction := getDefaultTransactionBeforeTransact()
	var lastInsertID, rowsAffected int64
	rowsAffected = 1
	dummyUpdateResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(updateAccountsDepositSql).
		WithArgs(dummyTransaction.Amount, dummyTransaction.AccountId).
		WillReturnResult(dummyUpdateResult)

	dummyDbErr := errors.New("some error message")
	mockDB.ExpectExec(insertTransactionsSql).
		WithArgs(dummyTransaction.AccountId, dummyTransaction.Amount, dummyTransaction.TransactionType, dummyTransaction.TransactionDate).
		WillReturnError(dummyDbErr)

	mockDB.ExpectRollback()

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while creating new bank account transaction: " + dummyDbErr.Error()

	//Act
	_, actualErr := accRepoDb.Transact(dummyTransaction)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing failed insertion of transaction into DB table")
	}
	if actualErr.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0]
	if actualLogMessage.Message != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
	}
}

func Test_Transact_returns_error_when_failure_committingDbTransaction(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	mockDB.ExpectBegin()

	dummyTransaction := getDefaultTransactionBeforeTransact()
	var lastInsertID, rowsAffected int64
	rowsAffected = 1
	dummyUpdateResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(updateAccountsDepositSql).
		WithArgs(dummyTransaction.Amount, dummyTransaction.AccountId).
		WillReturnResult(dummyUpdateResult)

	lastInsertID = dummyTransactionIdAsInt //dummyTransaction.TransactionId
	dummyInsertResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(insertTransactionsSql).
		WithArgs(dummyTransaction.AccountId, dummyTransaction.Amount, dummyTransaction.TransactionType, dummyTransaction.TransactionDate).
		WillReturnResult(dummyInsertResult)

	dummyErr := errors.New("some error message")
	mockDB.ExpectCommit().WillReturnError(dummyErr)

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while committing db transaction: " + dummyErr.Error()

	//Act
	_, actualErr := accRepoDb.Transact(dummyTransaction)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing failure committing DB transaction")
	}
	if actualErr.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0]
	if actualLogMessage.Message != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
	}
}

func Test_Transact_returns_error_when_gettingInsertId_fails(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	mockDB.ExpectBegin()

	dummyTransaction := getDefaultTransactionBeforeTransact()
	var lastInsertID, rowsAffected int64
	rowsAffected = 1
	dummyUpdateResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(updateAccountsDepositSql).
		WithArgs(dummyTransaction.Amount, dummyTransaction.AccountId).
		WillReturnResult(dummyUpdateResult)

	dummyErr := errors.New("some error message")
	dummyErrorResult := sqlmock.NewErrorResult(dummyErr)
	mockDB.ExpectExec(insertTransactionsSql).
		WithArgs(dummyTransaction.AccountId, dummyTransaction.Amount, dummyTransaction.TransactionType, dummyTransaction.TransactionDate).
		WillReturnResult(dummyErrorResult)

	mockDB.ExpectCommit()

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Error while getting id of newly inserted transaction: " + dummyErr.Error()

	//Act
	_, actualErr := accRepoDb.Transact(dummyTransaction)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing failure getting insert ID")
	}
	if actualErr.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0]
	if actualLogMessage.Message != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage.Message)
	}
}

func Test_Transact_returns_error_when_cannotFindAccount(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	mockDB.ExpectBegin()

	dummyTransaction := getDefaultTransactionBeforeTransact()
	var lastInsertID, rowsAffected int64
	rowsAffected = 1
	dummyUpdateResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(updateAccountsDepositSql).
		WithArgs(dummyTransaction.Amount, dummyTransaction.AccountId).
		WillReturnResult(dummyUpdateResult)

	lastInsertID = dummyTransactionIdAsInt //dummyTransaction.TransactionId
	dummyInsertResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(insertTransactionsSql).
		WithArgs(dummyTransaction.AccountId, dummyTransaction.Amount, dummyTransaction.TransactionType, dummyTransaction.TransactionDate).
		WillReturnResult(dummyInsertResult)

	mockDB.ExpectCommit()

	dummyErr := errors.New("some error message")
	mockDB.ExpectQuery(selectAccountsSql).WithArgs(dummyAccountId).WillReturnError(dummyErr)

	//Act
	logger.MuteLogger()
	_, actualErr := accRepoDb.Transact(dummyTransaction)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing failed finding of newly inserted account")
	}
	if actualErr.Message != defaultExpectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", defaultExpectedErrMessage, actualErr.Message)
	}
}

// to test line 72 + whether amount was updated correctly (might need actual db connection)
func Test_Transact_returns_newTransaction_when_transactionType_deposit(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	mockDB.ExpectBegin()

	dummyTransaction := getDefaultTransactionBeforeTransact()
	var lastInsertID, rowsAffected int64
	rowsAffected = 1
	dummyUpdateResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(updateAccountsDepositSql).
		WithArgs(dummyTransaction.Amount, dummyTransaction.AccountId).
		WillReturnResult(dummyUpdateResult)

	lastInsertID = dummyTransactionIdAsInt //dummyTransaction.TransactionId
	dummyInsertResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(insertTransactionsSql).
		WithArgs(dummyTransaction.AccountId, dummyTransaction.Amount, dummyTransaction.TransactionType, dummyTransaction.TransactionDate).
		WillReturnResult(dummyInsertResult)

	mockDB.ExpectCommit()

	dummyExistentAccount := getDefaultAccountAfterSave()
	dummyExistentAccount.Amount = dummyBalance
	columns := []string{"account_id", "customer_id", "opening_date", "account_type", "amount", "status"}
	dummyRows := sqlmock.NewRows(columns).
		AddRow(dummyExistentAccount.AccountId, dummyExistentAccount.CustomerId, dummyExistentAccount.OpeningDate, dummyExistentAccount.AccountType, dummyExistentAccount.Amount, dummyExistentAccount.Status)
	mockDB.ExpectQuery(selectAccountsSql).
		WithArgs(dummyExistentAccount.AccountId).
		WillReturnRows(dummyRows)

	expectedNewTransaction := getDefaultTransactionAfterTransact()

	//Act
	actualNewTransaction, err := accRepoDb.Transact(dummyTransaction)

	//Assert
	if err != nil {
		t.Fatal("Expected no error but got error while testing successful deposit: " + err.Message)
	}
	if *actualNewTransaction != expectedNewTransaction {
		t.Errorf("Expected transaction %v but got %v", expectedNewTransaction, *actualNewTransaction)
	}
}

// test line 74 + whether amount was updated correctly (might need actual db connection)
func Test_Transact_returns_newTransaction_when_transactionType_withdrawal(t *testing.T) {
	//Arrange
	teardown := setupAccountRepoDbTest(t)
	defer teardown()

	mockDB.ExpectBegin()

	dummyTransaction := Transaction{
		AccountId:       dummyAccountId,
		Amount:          dummyAmount,
		TransactionType: dto.TransactionTypeWithdrawal,
		TransactionDate: dummyDate,
	}
	var lastInsertID, rowsAffected int64
	rowsAffected = 1
	dummyUpdateResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(updateAccountsWithdrawalSql).
		WithArgs(dummyTransaction.Amount, dummyTransaction.AccountId).
		WillReturnResult(dummyUpdateResult)

	lastInsertID = dummyTransactionIdAsInt //dummyTransaction.TransactionId
	dummyInsertResult := sqlmock.NewResult(lastInsertID, rowsAffected)
	mockDB.ExpectExec(insertTransactionsSql).
		WithArgs(dummyTransaction.AccountId, dummyTransaction.Amount, dummyTransaction.TransactionType, dummyTransaction.TransactionDate).
		WillReturnResult(dummyInsertResult)

	mockDB.ExpectCommit()

	dummyExistentAccount := getDefaultAccountAfterSave()
	dummyExistentAccount.Amount = dummyBalanceAfterWithdrawal
	columns := []string{"account_id", "customer_id", "opening_date", "account_type", "amount", "status"}
	dummyRows := sqlmock.NewRows(columns).
		AddRow(dummyExistentAccount.AccountId, dummyExistentAccount.CustomerId, dummyExistentAccount.OpeningDate, dummyExistentAccount.AccountType, dummyExistentAccount.Amount, dummyExistentAccount.Status)
	mockDB.ExpectQuery(selectAccountsSql).
		WithArgs(dummyExistentAccount.AccountId).
		WillReturnRows(dummyRows)

	expectedNewTransaction := dummyTransaction
	expectedNewTransaction.TransactionId = dummyTransactionId
	expectedNewTransaction.Balance = dummyBalanceAfterWithdrawal

	//Act
	actualNewTransaction, err := accRepoDb.Transact(dummyTransaction)

	//Assert
	if err != nil {
		t.Fatal("Expected no error but got error while testing successful deposit: " + err.Message)
	}
	if *actualNewTransaction != expectedNewTransaction {
		t.Errorf("Expected transaction %v but got %v", expectedNewTransaction, *actualNewTransaction)
	}
}
