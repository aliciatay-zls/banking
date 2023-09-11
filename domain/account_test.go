package domain

import (
	"github.com/udemy-go-1/banking-lib/logger"
	"testing"
)

func init() {
	logger.MuteLogger()
}

func TestAccount_CanWithdraw_TrueWhenAccountBalanceSufficient(t *testing.T) {
	//Arrange
	account := Account{Amount: 1000}
	var withdrawalAmount float64 = 1000
	expectedResult := true

	//Act
	actualResult := account.CanWithdraw(withdrawalAmount)

	//Assert
	if actualResult != expectedResult {
		t.Errorf("expected %v but got %v while testing valid withdrawal amount", expectedResult, actualResult)
	}
}

func TestAccount_CanWithdraw_FalseWhenAccountBalanceInsufficient(t *testing.T) {
	//Arrange
	account := Account{Amount: 1000}
	var withdrawalAmount float64 = 2000
	expectedResult := false

	//Act
	actualResult := account.CanWithdraw(withdrawalAmount)

	//Assert
	if actualResult != expectedResult {
		t.Errorf("expected %v but got %v while testing invalid withdrawal amount", expectedResult, actualResult)

	}
}
