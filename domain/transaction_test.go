package domain

import (
	"github.com/udemy-go-1/banking/dto"
	"testing"
)

func TestTransaction_IsWithdrawal_GetCorrectResult(t *testing.T) {
	//Arrange
	transactions := []Transaction{
		Transaction{TransactionType: dto.TransactionTypeWithdrawal},
		Transaction{TransactionType: dto.TransactionTypeDeposit},
	}
	expectedResults := []bool{true, false}

	//Act
	actualResults := make([]bool, 2)
	for k, _ := range transactions {
		actualResults[k] = transactions[k].IsWithdrawal()
	}

	//Assert
	for k, _ := range expectedResults {
		if actualResults[k] != expectedResults[k] {
			t.Errorf("expected \"%v\" but got \"%v\"", expectedResults[k], actualResults[k])
		}
	}
}
