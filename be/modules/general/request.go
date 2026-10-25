package general

type GeneralRequest struct {
	Group       string `json:"group" binding:"required"`
	Description string `json:"description" binding:"required"`
	Status      string `json:"status"`
}

