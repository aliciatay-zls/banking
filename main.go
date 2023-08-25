package main

import (
	"github.com/aliciatay-zls/banking/app"
	"github.com/aliciatay-zls/banking/logger"
)

func main() {
	logger.Info("Starting the app...")
	app.Start()
}
