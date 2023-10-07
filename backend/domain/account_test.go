package domain

import "testing"

func TestAccount_CanWithdraw_returns_true_when_accountBalance_sufficient(t *testing.T) {
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

func TestAccount_CanWithdraw_returns_false_when_accountBalance_insufficient(t *testing.T) {
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
