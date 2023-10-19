package dto

type AccountResponse struct {
	AccountId   string  `json:"account_id"`
	AccountType string  `json:"account_type"`
	Amount      float64 `json:"amount"`
}
