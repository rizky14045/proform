package database

import (
	"fmt"
	"net/url"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect() (*gorm.DB, error) {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "127.0.0.1"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "macbookpro"
	}

	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "proform"
	}

	schema := os.Getenv("DB_SCHEMA")
	if schema == "" {
		schema = "public"
	}

	var dsn string
	if password != "" {
		dsn = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable&search_path=%s",
			url.QueryEscape(user),
			url.QueryEscape(password),
			host,
			port,
			dbname,
			schema,
		)
	} else {
		dsn = fmt.Sprintf("postgres://%s@%s:%s/%s?sslmode=disable&search_path=%s",
			url.QueryEscape(user),
			host,
			port,
			dbname,
			schema,
		)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	return db, nil
}
