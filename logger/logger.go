package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Wrap logger
var appLogger *zap.Logger //declare

func init() {
	config := zap.NewProductionConfig()

	customConfig := zap.NewProductionEncoderConfig()
	customConfig.TimeKey = "timestamp"
	customConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	customConfig.StacktraceKey = ""

	config.EncoderConfig = customConfig

	var err error
	appLogger, err = config.Build(zap.AddCallerSkip(1)) //initialize
	if err != nil {
		panic(err)
	}
}

// Expose its functionalities
func Info(message string, fields ...zap.Field) { //[]zap.Field
	appLogger.Info(message, fields...) //unpack slice
}

func Debug(message string, fields ...zap.Field) {
	appLogger.Debug(message, fields...)
}

func Error(message string, fields ...zap.Field) {
	appLogger.Error(message, fields...)
}

func Fatal(message string, fields ...zap.Field) {
	appLogger.Fatal(message, fields...)
}
