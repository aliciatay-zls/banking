package service

import (
	"github.com/aliciatay-zls/banking-lib/clock"
	"github.com/aliciatay-zls/banking-lib/errs"
	"github.com/aliciatay-zls/banking-lib/logger"
	"github.com/aliciatay-zls/banking/backend/domain"
	"github.com/aliciatay-zls/banking/backend/dto"
)

//go:generate mockgen -destination=../mocks/service/mock_accountService.go -package=service github.com/aliciatay-zls/banking/backend/service AccountService
type AccountService interface { //service (primary port)
	GetAllAccounts(string) ([]dto.AccountResponse, *errs.AppError)
	CreateNewAccount(dto.NewAccountRequest) (*dto.NewAccountResponse, *errs.AppError)
	MakeTransaction(dto.TransactionRequest) (*dto.TransactionResponse, *errs.AppError)
}

type DefaultAccountService struct { //business/domain object
	repo domain.AccountRepository //Business Domain has dependency on repo (repo is a field)
	clk  clock.Clock
}

func NewAccountService(repo domain.AccountRepository, clk clock.Clock) DefaultAccountService {
	return DefaultAccountService{repo, clk}
}

func (s DefaultAccountService) GetAllAccounts(customerId string) ([]dto.AccountResponse, *errs.AppError) {
	accounts, err := s.repo.FindAll(customerId)
	if err != nil {
		return nil, err
	}

	response := make([]dto.AccountResponse, 0)
	for _, a := range accounts {
		response = append(response, *a.ToDTO())
	}
	return response, nil
}

func (s DefaultAccountService) CreateNewAccount(request dto.NewAccountRequest) (*dto.NewAccountResponse, *errs.AppError) { //Business Domain implements service
	account := domain.NewAccount(request.CustomerId, request.AccountType, request.Amount, s.clk)

	newAccount, err := s.repo.Save(account)
	if err != nil {
		return nil, err
	}

	return newAccount.ToNewAccountResponseDTO(), nil
}

// MakeTransaction checks whether the values in the given request's body are valid, whether the given account exists,
// and whether the current account balance allows for the request to be fulfilled. If so, it passes the request down
// to the server side as an Account object and passes the returned Account DTO back up to the REST handler.
func (s DefaultAccountService) MakeTransaction(request dto.TransactionRequest) (*dto.TransactionResponse, *errs.AppError) { //Business Domain implements service
	account, err := s.repo.FindById(request.AccountId)
	if err != nil {
		return nil, err
	}

	if request.TransactionType == dto.TransactionTypeWithdrawal {
		if !account.CanWithdraw(request.Amount) {
			logger.Error("Amount to withdraw exceeds account balance")
			return nil, errs.NewValidationError("Account balance insufficient to withdraw given amount")
		}
	}

	transaction := domain.NewTransaction(request.AccountId, request.Amount, request.TransactionType, s.clk)

	completedTransaction, err := s.repo.Transact(transaction)
	if err != nil {
		return nil, err
	}

	return completedTransaction.ToTransactionResponseDTO(), nil
}
