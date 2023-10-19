// Code generated by MockGen. DO NOT EDIT.
// Source: github.com/udemy-go-1/banking/backend/service (interfaces: AccountService)

// Package service is a generated GoMock package.
package service

import (
	reflect "reflect"

	errs "github.com/udemy-go-1/banking-lib/errs"
	dto "github.com/udemy-go-1/banking/backend/dto"
	gomock "go.uber.org/mock/gomock"
)

// MockAccountService is a mock of AccountService interface.
type MockAccountService struct {
	ctrl     *gomock.Controller
	recorder *MockAccountServiceMockRecorder
}

// MockAccountServiceMockRecorder is the mock recorder for MockAccountService.
type MockAccountServiceMockRecorder struct {
	mock *MockAccountService
}

// NewMockAccountService creates a new mock instance.
func NewMockAccountService(ctrl *gomock.Controller) *MockAccountService {
	mock := &MockAccountService{ctrl: ctrl}
	mock.recorder = &MockAccountServiceMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockAccountService) EXPECT() *MockAccountServiceMockRecorder {
	return m.recorder
}

// CreateNewAccount mocks base method.
func (m *MockAccountService) CreateNewAccount(arg0 dto.NewAccountRequest) (*dto.NewAccountResponse, *errs.AppError) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "CreateNewAccount", arg0)
	ret0, _ := ret[0].(*dto.NewAccountResponse)
	ret1, _ := ret[1].(*errs.AppError)
	return ret0, ret1
}

// CreateNewAccount indicates an expected call of CreateNewAccount.
func (mr *MockAccountServiceMockRecorder) CreateNewAccount(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "CreateNewAccount", reflect.TypeOf((*MockAccountService)(nil).CreateNewAccount), arg0)
}

// GetAllAccounts mocks base method.
func (m *MockAccountService) GetAllAccounts(arg0 string) ([]dto.AccountResponse, *errs.AppError) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetAllAccounts", arg0)
	ret0, _ := ret[0].([]dto.AccountResponse)
	ret1, _ := ret[1].(*errs.AppError)
	return ret0, ret1
}

// GetAllAccounts indicates an expected call of GetAllAccounts.
func (mr *MockAccountServiceMockRecorder) GetAllAccounts(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetAllAccounts", reflect.TypeOf((*MockAccountService)(nil).GetAllAccounts), arg0)
}

// MakeTransaction mocks base method.
func (m *MockAccountService) MakeTransaction(arg0 dto.TransactionRequest) (*dto.TransactionResponse, *errs.AppError) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "MakeTransaction", arg0)
	ret0, _ := ret[0].(*dto.TransactionResponse)
	ret1, _ := ret[1].(*errs.AppError)
	return ret0, ret1
}

// MakeTransaction indicates an expected call of MakeTransaction.
func (mr *MockAccountServiceMockRecorder) MakeTransaction(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "MakeTransaction", reflect.TypeOf((*MockAccountService)(nil).MakeTransaction), arg0)
}
