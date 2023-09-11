package domain

import (
	"github.com/udemy-go-1/banking-lib/logger"
	"testing"
)

func init() {
	logger.MuteLogger()
}

func TestCustomer_AsStatusName_GetCorrectStatus(t *testing.T) {
	//Arrange
	customers := []Customer{
		Customer{Status: "1"},
		Customer{Status: "0"},
	}
	expectedStatuses := []string{"active", "inactive"}

	//Act
	actualStatuses := make([]string, 2)
	for k, _ := range customers {
		actualStatuses[k] = customers[k].AsStatusName()
	}

	//Assert
	for k, _ := range expectedStatuses {
		if actualStatuses[k] != expectedStatuses[k] {
			t.Errorf("expected customer status \"%v\" but got \"%v\"", expectedStatuses[k], actualStatuses[k])
		}
	}
}
