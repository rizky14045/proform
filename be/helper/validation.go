package helper

import "github.com/go-playground/validator/v10"

func ValidationMessage(fe validator.FieldError) string {
	switch fe.Tag() {

	case "required":
		return fe.Field() + " is required"
	case "email":
		return "Invalid email format"
	case "numeric":
		return fe.Field() + " must be a number!"
	case "gt":
		return fe.Field() + " must be greater than " + fe.Param()
	default:
		return "Invalid input"
	}

}
