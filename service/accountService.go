package service

import (
	"github.com/udemy-go-1/banking-lib/errs"
	"github.com/udemy-go-1/banking-lib/logger"
	"github.com/udemy-go-1/banking/domain"
	"github.com/udemy-go-1/banking/dto"
)

//go:generate mockgen -destination=../mocks/service/mock_accountService.go -package=service github.com/udemy-go-1/banking/service AccountService
type AccountService interface { //service (primary port)
	CreateNewAccount(dto.NewAccountRequest) (*dto.NewAccountResponse, *errs.AppError)
	MakeTransaction(dto.TransactionRequest) (*dto.TransactionResponse, *errs.AppError)
}

type DefaultAccountService struct { //business/domain object
	repo domain.AccountRepository //Business Domain has dependency on repo (repo is a field)
}

func NewAccountService(repo domain.AccountRepository) DefaultAccountService {
	return DefaultAccountService{repo}
}

func (s DefaultAccountService) CreateNewAccount(request dto.NewAccountRequest) (*dto.NewAccountResponse, *errs.AppError) { //Business Domain implements service
	if err := request.Validate(); err != nil {
		return nil, err
	}

	account := domain.NewAccount(request.CustomerId, *request.AccountType, *request.Amount)

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
	if err := request.Validate(); err != nil {
		return nil, err
	}

	account, err := s.repo.FindById(request.AccountId)
	if err != nil {
		return nil, err
	}

	if *request.TransactionType == dto.TransactionTypeWithdrawal {
		if !account.CanWithdraw(*request.Amount) {
			logger.Error("Amount to withdraw exceeds account balance")
			return nil, errs.NewValidationError("Account balance insufficient to withdraw given amount")
		}
	}

	transaction := domain.NewTransaction(request.AccountId, *request.Amount, *request.TransactionType)

	completedTransaction, err := s.repo.Transact(transaction)
	if err != nil {
		return nil, err
	}

	return completedTransaction.ToTransactionResponseDTO(), nil
}
