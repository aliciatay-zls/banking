package main

import (
	"github.com/aliciatay-zls/banking-lib/formValidator"
	"github.com/aliciatay-zls/banking-lib/logger"
	"github.com/aliciatay-zls/banking/backend/app"
)

func main() {
	logger.Info("Starting the app...")
	formValidator.Create()
	app.Start()
}
