package config

import (
	"log"

	"github.com/joho/godotenv"
)

func LoadEnv() error {
	err := godotenv.Load(".env")
	if err != nil {
		err = godotenv.Load("be/.env")
	}
	if err != nil {
		log.Println("Warning: .env file not found, using system env vars.")
	}
	return nil
}
