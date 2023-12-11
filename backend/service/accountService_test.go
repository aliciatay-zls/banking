package service

import (
	"github.com/asaskevich/govalidator"
	"github.com/udemy-go-1/banking-lib/clock"
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/backend/domain"
	"github.com/udemy-go-1/banking/backend/dto"
	mocksDomain "github.com/udemy-go-1/banking/backend/mocks/domain"
	"go.uber.org/mock/gomock"
	"testing"
)

// Package common variables and inputs
const dummyCustomerId = "2"

// Test common variables and inputs
var mockAccountRepo *mocksDomain.MockAccountRepository
var mockClock clock.Clock
var accSvc DefaultAccountService

var dummyAmount float64 = 6000

var dummyAccountType = dto.AccountTypeSaving
var dummyTransactionType = dto.TransactionTypeWithdrawal

const dummyAccountId = "1977"
const dummyTransactionId = "7791"
const dummyBalance = 0

func init() {
	govalidator.SetFieldsRequiredByDefault(true)
}

func setupAccountServiceTest(t *testing.T) func() {
	ctrl := gomock.NewController(t)
	mockAccountRepo = mocksDomain.NewMockAccountRepository(ctrl)
	mockClock = clock.StaticClock{}
	accSvc = NewAccountService(mockAccountRepo, mockClock) //prevents flaky tests due to minor time differences

	return func() {
		mockAccountRepo = nil
		defer ctrl.Finish()
	}
}

// getDefaultDummyNewAccountRequest returns a dto.NewAccountRequest for the customer with id 2 wanting to open
// a saving account of amount 6000
func getDefaultDummyNewAccountRequest() dto.NewAccountRequest {
	return dto.NewAccountRequest{
		CustomerId:  dummyCustomerId,
		AccountType: dummyAccountType,
		Amount:      dummyAmount,
	}
}

// getDefaultDummyTransactionRequest returns a dto.TransactionRequest for the customer with id 2 wanting to
// make a withdrawal of amount 6000 on the account with id 1977
func getDefaultDummyTransactionRequest() dto.TransactionRequest {
	return dto.TransactionRequest{
		AccountId:       dummyAccountId,
		Amount:          dummyAmount,
		TransactionType: dummyTransactionType,
		CustomerId:      dummyCustomerId,
	}
}

// getDefaultDummyAccount returns a domain.Account of saving type and amount 6000 belonging to the customer with id 2,
// opened on 2 Jan 2006, before it was saved to the db.
func getDefaultDummyAccount() domain.Account {
	return domain.NewAccount(dummyCustomerId, dummyAccountType, dummyAmount, mockClock)
}

// getDefaultDummyTransaction returns a domain.Transaction of withdrawal type and amount 6000 made on the account
// with number 1977, on 2 Jan 2006, before it was saved to the db.
func getDefaultDummyTransaction() domain.Transaction {
	return domain.NewTransaction(dummyAccountId, dummyAmount, dummyTransactionType, mockClock)
}

func TestDefaultAccountService_CreateNewAccount_returns_error_when_validatingNewAccountRequest_fails(t *testing.T) {
	//Arrange
	accSvc = NewAccountService(nil, mockClock)

	dummyNewAccountRequest := getDefaultDummyNewAccountRequest()
	var invalidAmount float64 = 0
	dummyNewAccountRequest.Amount = invalidAmount

	//Act
	logger.MuteLogger()
	_, err := accSvc.CreateNewAccount(dummyNewAccountRequest)

	//Assert
	if err == nil {
		t.Error("Expected error but got none while testing error during validation")
	}
}

func TestDefaultAccountService_CreateNewAccount_returns_error_when_repo_fails(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyNewAccountRequest := getDefaultDummyNewAccountRequest()
	dummyAccount := getDefaultDummyAccount() //uses mock clock
	dummyAppErr := errs.NewUnexpectedError("some error message")
	mockAccountRepo.EXPECT().Save(dummyAccount).Return(nil, dummyAppErr)

	//Act
	_, err := accSvc.CreateNewAccount(dummyNewAccountRequest) //uses mock clock

	//Assert
	if err == nil {
		t.Fatal("Expected error but got none while testing error during saving of new account")
	}
	if err.Message != dummyAppErr.Message {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", dummyAppErr.Message, err.Message)
	}
}

func TestDefaultAccountService_CreateNewAccount_returns_newAccountId_when_repo_succeeds(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyNewAccountRequest := getDefaultDummyNewAccountRequest()
	dummyAccount := getDefaultDummyAccount()
	dummyNewAccount := dummyAccount
	dummyNewAccount.AccountId = dummyAccountId //after saving into db
	mockAccountRepo.EXPECT().Save(dummyAccount).Return(&dummyNewAccount, nil)

	//Act
	newAccountResponse, err := accSvc.CreateNewAccount(dummyNewAccountRequest)

	//Assert
	if err != nil {
		t.Fatal("Expected no error but got error while testing successful creation of new account: " + err.Message)
	}
	if newAccountResponse.AccountId != dummyNewAccount.AccountId {
		t.Errorf("Expected new account id returned to be %s but got %s",
			dummyNewAccount.AccountId, newAccountResponse.AccountId)
	}
}

func TestDefaultAccountService_MakeTransaction_returns_error_when_validatingTransactionRequest_fails(t *testing.T) {
	//Arrange
	accSvc = NewAccountService(nil, mockClock)

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	var invalidAmount float64 = -100
	dummyTransactionRequest.Amount = invalidAmount

	//Act
	logger.MuteLogger()
	_, err := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if err == nil {
		t.Error("Expected error but got none while testing error during validation")
	}
}

func TestDefaultAccountService_MakeTransaction_returns_error_when_nonExistentAccount(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	dummyAppErr := errs.NewNotFoundError("some error message")
	mockAccountRepo.EXPECT().FindById(dummyTransactionRequest.AccountId).Return(nil, dummyAppErr)

	//Act
	_, err := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if err == nil {
		t.Fatal("Expected error but got none while testing non-existent account")
	}
	if err.Message != dummyAppErr.Message {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", dummyAppErr.Message, err.Message)
	}
}

func TestDefaultAccountService_MakeTransaction_returns_error_when_cannotWithdraw(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	var insufficientBalance float64 = 10
	dummyExistentAccount := getDefaultDummyAccount()
	dummyExistentAccount.Amount = insufficientBalance
	dummyExistentAccount.AccountId = dummyAccountId //after saving into db
	mockAccountRepo.EXPECT().FindById(dummyTransactionRequest.AccountId).Return(&dummyExistentAccount, nil)

	expectedErrMessage := "Account balance insufficient to withdraw given amount"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Amount to withdraw exceeds account balance"

	//Act
	_, actualErr := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if actualErr == nil {
		t.Fatal("Expected error but got none while testing unable to withdraw")
	}
	if actualErr.Message != expectedErrMessage {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", expectedErrMessage, actualErr.Message)
	}
	if logs.Len() != 1 {
		t.Fatalf("Expected 1 message to be logged but got %d logs", logs.Len())
	}
	actualLogMessage := logs.All()[0].Message
	if actualLogMessage != expectedLogMessage {
		t.Errorf("Expected log message to be \"%s\" but got \"%s\"", expectedLogMessage, actualLogMessage)
	}
}

func TestDefaultAccountService_MakeTransaction_returns_error_when_repo_fails(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	dummyExistentAccount := getDefaultDummyAccount()
	dummyExistentAccount.AccountId = dummyAccountId
	mockAccountRepo.EXPECT().FindById(dummyTransactionRequest.AccountId).Return(&dummyExistentAccount, nil)

	dummyTransaction := getDefaultDummyTransaction()
	dummyAppErr := errs.NewUnexpectedError("some error message")
	mockAccountRepo.EXPECT().Transact(dummyTransaction).Return(nil, dummyAppErr)

	//Act
	_, err := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if err == nil {
		t.Fatal("Expected error but got none while testing error during making of transaction")
	}
	if err.Message != dummyAppErr.Message {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", dummyAppErr.Message, err.Message)
	}
}

func TestDefaultAccountService_MakeTransaction_returns_newTransactionDetails_when_repo_succeeds(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	dummyExistentAccount := getDefaultDummyAccount()
	dummyExistentAccount.AccountId = dummyAccountId
	mockAccountRepo.EXPECT().FindById(dummyTransactionRequest.AccountId).Return(&dummyExistentAccount, nil)

	dummyTransaction := getDefaultDummyTransaction()
	dummyNewTransaction := dummyTransaction
	dummyNewTransaction.TransactionId = dummyTransactionId
	dummyNewTransaction.Balance = dummyBalance
	mockAccountRepo.EXPECT().Transact(dummyTransaction).Return(&dummyNewTransaction, nil)

	//Act
	newTransactionResponse, err := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if err != nil {
		t.Fatal("Expected no error but got error while testing successful finding, sufficient balance and transacting: " + err.Message)
	}
	if newTransactionResponse.TransactionId != dummyNewTransaction.TransactionId {
		t.Errorf("Expected new transaction id to be %s but got %s",
			dummyNewTransaction.TransactionId, newTransactionResponse.TransactionId)
	}
	if newTransactionResponse.Balance != dummyNewTransaction.Balance {
		t.Errorf("Expected new balance to be %f but got %f",
			dummyNewTransaction.Balance, newTransactionResponse.Balance)
	}
}
