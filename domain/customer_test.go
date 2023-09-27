package domain

import "testing"

func TestCustomer_AsStatusName_returns_correctStatus(t *testing.T) {
	//Arrange
	tests := []struct {
		name           string
		customer       Customer
		expectedStatus string
	}{
		{"status 1", Customer{Status: "1"}, "active"},
		{"status 0", Customer{Status: "0"}, "inactive"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			//Act
			actualStatus := tc.customer.AsStatusName()

			//Assert
			if actualStatus != tc.expectedStatus {
				t.Errorf("Expected customer status \"%v\" but got \"%v\"", tc.expectedStatus, actualStatus)
			}
		})
	}
}
