package stock_code

type StockCodeRequest struct {
	Code          string  `json:"code" binding:"required"`
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	UOI           string  `json:"uoi"`
	SOH           float64 `json:"soh"`
	WarehouseCode string  `json:"warehouse_code"`
	BinLocation   string  `json:"bin_location"`
	Mnemonic      string  `json:"mnemonic"`
	PartNumber    string  `json:"part_number"`
	IsActive      *bool   `json:"is_active"`
}

