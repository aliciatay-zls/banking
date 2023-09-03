package main

import (
	"github.com/aliciatay-zls/banking/app"
	"github.com/udemy-go-1/banking-lib/logger"
)

func main() {
	logger.Info("Starting the app...")
	app.Start()
}
