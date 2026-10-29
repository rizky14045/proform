package supplier

type SupplierRequest struct {
	Code            string `json:"code" binding:"required"`
	Name            string `json:"name" binding:"required"`
	NPWP            string `json:"npwp"`
	Category        string `json:"category"`
	PICName         string `json:"pic_name"`
	Phone           string `json:"phone"`
	Email           string `json:"email"`
	Address         string `json:"address"`
	City            string `json:"city"`
	Fax             string `json:"fax"`
	Status          string `json:"status"`
	OrderPICName    string `json:"order_pic_name"`
	OrderPICEmail   string `json:"order_pic_email"`
	OrderPICAddress string `json:"order_pic_address"`
	OrderPICPhone   string `json:"order_pic_phone"`
}

