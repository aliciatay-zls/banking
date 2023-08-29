package service

import (
	"github.com/aliciatay-zls/banking/domain"
	"github.com/aliciatay-zls/banking/dto"
	"github.com/aliciatay-zls/banking/errs"
	"time"
)

type TransactionService interface { //service (primary port)
	MakeTransaction(dto.TransactionRequest) (*dto.TransactionResponse, *errs.AppError)
}

type DefaultTransactionService struct { //business/domain object
	repo domain.TransactionRepository //Business Domain has dependency on repo (repo is a field)
}

func NewDefaultTransactionService(repo domain.TransactionRepository) DefaultTransactionService {
	return DefaultTransactionService{repo}
}

func (s DefaultTransactionService) MakeTransaction(request dto.TransactionRequest) (*dto.TransactionResponse, *errs.AppError) { //Business Domain implements service
	if err := request.Validate(); err != nil {
		return nil, err
	}

	transaction := domain.Transaction{
		AccountId:       request.AccountId,
		Amount:          request.Amount,
		TransactionType: request.TransactionType,
		TransactionDate: time.Now().Format("2006-01-02 15:04:05"),
	}

	completedTransaction, err := s.repo.Transact(transaction)
	if err != nil {
		return nil, err
	}

	response := completedTransaction.ToTransactionResponseDTO()

	return response, nil
}
