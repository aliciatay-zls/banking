package domain

import (
	"github.com/udemy-go-1/banking/dto"
	"testing"
)

func TestTransaction_IsWithdrawal_returns_correctResult(t *testing.T) {
	//Arrange
	tests := []struct {
		name           string
		transaction    Transaction
		expectedResult bool
	}{
		{"withdrawal", Transaction{TransactionType: dto.TransactionTypeWithdrawal}, true},
		{"deposit", Transaction{TransactionType: dto.TransactionTypeDeposit}, false},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			//Act
			actualResult := tc.transaction.IsWithdrawal()

			//Assert
			if actualResult != tc.expectedResult {
				t.Errorf("expected \"%v\" but got \"%v\"", tc.expectedResult, actualResult)
			}
		})
	}
}
