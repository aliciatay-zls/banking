package service

import (
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/domain"
	"github.com/udemy-go-1/banking/dto"
	mocksDomain "github.com/udemy-go-1/banking/mocks/domain"
	"go.uber.org/mock/gomock"
	"testing"
)

// Test common variables and inputs
var mockAccountRepo *mocksDomain.MockAccountRepository
var accSvc DefaultAccountService

var dummyAccountType = dto.AccountTypeSaving
var dummyTransactionType = dto.TransactionTypeWithdrawal
var dummyAmount float64 = 6000

const dummyCustomerId = "2"
const dummyAccountId = "1977"
const dummyTransactionId = "7791"
const dummyBalance = 0

func setupAccountServiceTest(t *testing.T) func() {
	ctrl := gomock.NewController(t)
	mockAccountRepo = mocksDomain.NewMockAccountRepository(ctrl)
	accSvc = NewAccountService(mockAccountRepo)

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
		AccountType: &dummyAccountType,
		Amount:      &dummyAmount,
	}
}

// getDefaultDummyTransactionRequest returns a dto.TransactionRequest for the customer with id 2 wanting to
// make a withdrawal of amount 6000 on the account with id 1977
func getDefaultDummyTransactionRequest() dto.TransactionRequest {
	return dto.TransactionRequest{
		AccountId:       dummyAccountId,
		Amount:          &dummyAmount,
		TransactionType: &dummyTransactionType,
		CustomerId:      dummyCustomerId,
	}
}

func TestAccountService_CreateNewAccount_ErrorWhenValidatingNewAccountRequestFails(t *testing.T) {
	//Arrange
	accSvc = NewAccountService(nil)

	dummyNewAccountRequest := getDefaultDummyNewAccountRequest()
	var invalidAmount float64 = 0
	dummyNewAccountRequest.Amount = &invalidAmount

	//Act
	logger.MuteLogger()
	_, err := accSvc.CreateNewAccount(dummyNewAccountRequest)

	//Assert
	if err == nil {
		t.Error("Expected error but got none while testing error during validation")
	}
}

func TestAccountService_CreateNewAccount_ErrorWhenRepoFails(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyNewAccountRequest := getDefaultDummyNewAccountRequest()
	dummyAccount := domain.NewAccount(dummyCustomerId, dummyAccountType, dummyAmount)
	dummyAppErr := errs.NewUnexpectedError("some error message")
	mockAccountRepo.EXPECT().Save(dummyAccount).Return(nil, dummyAppErr)

	//Act
	_, err := accSvc.CreateNewAccount(dummyNewAccountRequest)

	//Assert
	if err == nil {
		t.Error("Expected error but got none while testing error during saving of new account")
	}
	if err.Message != dummyAppErr.Message {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", dummyAppErr.Message, err.Message)
	}
}

func TestAccountService_CreateNewAccount_NewAccountIdWhenRepoSucceeds(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyNewAccountRequest := getDefaultDummyNewAccountRequest()
	dummyAccount := domain.NewAccount(dummyCustomerId, dummyAccountType, dummyAmount)
	dummyNewAccount := dummyAccount
	dummyNewAccount.AccountId = dummyAccountId
	mockAccountRepo.EXPECT().Save(dummyAccount).Return(&dummyNewAccount, nil)

	//Act
	newAccountResponse, err := accSvc.CreateNewAccount(dummyNewAccountRequest)

	//Assert
	if err != nil {
		t.Error("Expected no error but got error while testing successful creation of new account: " + err.Message)
	}
	if newAccountResponse.AccountId != dummyNewAccount.AccountId {
		t.Errorf("Expected new account id returned to be %s but got %s",
			dummyNewAccount.AccountId, newAccountResponse.AccountId)
	}
}

func TestAccountService_MakeTransaction_ErrorWhenValidatingTransactionRequestFails(t *testing.T) {
	//Arrange
	accSvc = NewAccountService(nil)

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	var invalidAmount float64 = -100
	dummyTransactionRequest.Amount = &invalidAmount

	//Act
	logger.MuteLogger()
	_, err := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if err == nil {
		t.Error("Expected error but got none while testing error during validation")
	}
}

func TestAccountService_MakeTransaction_ErrorWhenNonExistentAccount(t *testing.T) {
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
		t.Error("Expected error but got none while testing non-existent account")
	}
	if err.Message != dummyAppErr.Message {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", dummyAppErr.Message, err.Message)
	}
}

func TestAccountService_MakeTransaction_ErrorWhenCannotWithdraw(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	var insufficientBalance float64 = 10
	dummyExistentAccount := domain.NewAccount(dummyCustomerId, dummyAccountType, insufficientBalance)
	dummyExistentAccount.AccountId = dummyAccountId
	mockAccountRepo.EXPECT().FindById(dummyTransactionRequest.AccountId).Return(&dummyExistentAccount, nil)

	expectedErrMessage := "Account balance insufficient to withdraw given amount"

	logs := logger.ReplaceWithTestLogger()
	expectedLogMessage := "Amount to withdraw exceeds account balance"

	//Act
	_, actualErr := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if actualErr == nil {
		t.Error("Expected error but got none while testing unable to withdraw")
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

func TestAccountService_MakeTransaction_ErrorWhenRepoFails(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	dummyExistentAccount := domain.NewAccount(dummyCustomerId, dummyAccountType, dummyAmount)
	dummyExistentAccount.AccountId = dummyAccountId
	mockAccountRepo.EXPECT().FindById(dummyTransactionRequest.AccountId).Return(&dummyExistentAccount, nil)

	dummyTransaction := domain.NewTransaction(dummyAccountId, dummyAmount, dummyTransactionType)
	dummyAppErr := errs.NewUnexpectedError("some error message")
	mockAccountRepo.EXPECT().Transact(dummyTransaction).Return(nil, dummyAppErr)

	//Act
	_, err := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if err == nil {
		t.Error("Expected error but got none while testing error during making of transaction")
	}
	if err.Message != dummyAppErr.Message {
		t.Errorf("Expected error message to be \"%s\" but got \"%s\"", dummyAppErr.Message, err.Message)
	}
}

func TestAccountService_MakeTransaction_NewTransactionDetailsWhenRepoSucceeds(t *testing.T) {
	//Arrange
	teardown := setupAccountServiceTest(t)
	defer teardown()

	dummyTransactionRequest := getDefaultDummyTransactionRequest()
	dummyExistentAccount := domain.NewAccount(dummyCustomerId, dummyAccountType, dummyAmount)
	dummyExistentAccount.AccountId = dummyAccountId
	mockAccountRepo.EXPECT().FindById(dummyTransactionRequest.AccountId).Return(&dummyExistentAccount, nil)

	dummyTransaction := domain.NewTransaction(dummyAccountId, dummyAmount, dummyTransactionType)
	dummyNewTransaction := dummyTransaction
	dummyNewTransaction.TransactionId = dummyTransactionId
	dummyNewTransaction.Balance = dummyBalance
	mockAccountRepo.EXPECT().Transact(dummyTransaction).Return(&dummyNewTransaction, nil)

	//Act
	newTransactionResponse, err := accSvc.MakeTransaction(dummyTransactionRequest)

	//Assert
	if err != nil {
		t.Error("Expected no error but got error while testing successful finding, sufficient balance and transacting: " + err.Message)
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
