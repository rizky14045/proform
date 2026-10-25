package database

import (
	"log"
	"template/helper"
	"template/modules/general"
	"template/modules/role"
	"template/modules/structure"
	"template/modules/user"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func SeedDatabase(db *gorm.DB) {
	// 1. Seed Roles
	var roleCount int64
	db.Model(&role.Role{}).Count(&roleCount)
	if roleCount == 0 {
		log.Println("Seeding default roles...")
		roles := []role.Role{
			{Code: "ADMIN", Name: "Administrator", Description: "Pengguna dengan hak akses penuh semua modul sistem"},
			{Code: "GM", Name: "General Manager", Description: "Pimpinan tertinggi unit pembangkit"},
			{Code: "MGR_USER", Name: "Manager User", Description: "Manajer peminta pengadaan / user bidang"},
			{Code: "SPV_USER", Name: "Supervisor User", Description: "Supervisor seksi peminta pengadaan"},
			{Code: "STAFF_USER", Name: "Staff User", Description: "Staff pelaksana teknis peminta pengadaan"},
			{Code: "MGR_LOGISTIK", Name: "Manager Logistik", Description: "Manajer bidang logistik & pengadaan"},
			{Code: "SPV_INVENTORY", Name: "Supervisor Inventory", Description: "Supervisor perencana pengadaan / inventori"},
			{Code: "STAFF_INVENTORY", Name: "Staff Inventory", Description: "Staff perencana pengadaan / kataloger"},
			{Code: "SPV_PENGADAAN", Name: "Supervisor Pengadaan", Description: "Supervisor pelaksana pengadaan barang dan jasa"},
			{Code: "STAFF_PENGADAAN", Name: "Staff Pengadaan", Description: "Buyer / staf pelaksana proses sourcing dan tender"},
			{Code: "SPV_GUDANG", Name: "Supervisor Gudang", Description: "Supervisor administrasi dan operasional gudang"},
			{Code: "STAFF_GUDANG", Name: "Staff Gudang", Description: "Staff pemeriksa penerimaan fisik barang gudang"},
			{Code: "MGR_KEUANGAN", Name: "Manager Keuangan", Description: "Manajer keuangan dan administrasi"},
			{Code: "SPV_KEUANGAN", Name: "Supervisor Keuangan", Description: "Supervisor administrasi keuangan dan anggaran"},
			{Code: "STAFF_KEUANGAN", Name: "Staff Keuangan", Description: "Staff administrasi keuangan"},
		}
		for i := range roles {
			roles[i].ID = uuid.New()
			roles[i].Status = "ACTIVE"
			_ = db.Create(&roles[i])
		}
	}

	// 2. Seed Default Structures (Jabatan/Organisasi)
	var structCount int64
	db.Model(&structure.Structure{}).Count(&structCount)
	if structCount == 0 {
		log.Println("Seeding default structures...")
		structures := []structure.Structure{
			{Code: "GM_OFFICE", Name: "General Manager", Description: "Kantor General Manager"},
			{Code: "BIDANG_HAR", Name: "Manajer Pemeliharaan", Description: "Bidang Pemeliharaan Pembangkit"},
			{Code: "RENDAL_HAR", Name: "Supervisor Senior Rendal Pemeliharaan", Description: "Seksi Perencanaan & Pengendalian Pemeliharaan"},
			{Code: "BIDANG_LOGISTIK", Name: "Manajer Logistik", Description: "Bidang Logistik & Pergudangan"},
			{Code: "PERENCANAAN_PENGADAAN", Name: "Supervisor Senior Inventori Kontrol & Kataloger", Description: "Seksi Perencanaan Pengadaan & Inventori"},
			{Code: "PELAKSANA_PENGADAAN", Name: "Supervisor Senior Pengadaan", Description: "Seksi Pelaksana Pengadaan"},
			{Code: "GUDANG", Name: "Supervisor Senior Administrasi Gudang", Description: "Seksi Gudang & Penerimaan Material"},
			{Code: "BIDANG_KEUANGAN", Name: "Manajer Keuangan & Administrasi", Description: "Bidang Keuangan & Administrasi"},
		}
		for i := range structures {
			structures[i].ID = uuid.New()
			structures[i].Status = "ACTIVE"
			_ = db.Create(&structures[i])
		}
	}

	// 3. Seed Default Users for All Roles
	defaultUsers := []struct {
		NID        string
		Name       string
		Email      string
		NIK        string
		RoleCode   string
		StructCode string
		Phone      string
		Address    string
		UserType   string
	}{
		{NID: "admin", Name: "Administrator Sistem", Email: "admin@interlogs.pln.co.id", NIK: "3216000000000001", RoleCode: "ADMIN", StructCode: "GM_OFFICE", Phone: "08123456789", Address: "UP Sembalang, Lampung", UserType: "ADMIN"},
		{NID: "gm", Name: "Budi Santoso (General Manager)", Email: "gm@interlogs.pln.co.id", NIK: "3216000000000002", RoleCode: "GM", StructCode: "GM_OFFICE", Phone: "08123456781", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "mgr_user", Name: "Hendra Wijaya (Manager Pemeliharaan)", Email: "mgr_user@interlogs.pln.co.id", NIK: "3216000000000003", RoleCode: "MGR_USER", StructCode: "BIDANG_HAR", Phone: "08123456782", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "spv_user", Name: "Rizky Pratama (Supervisor Rendal Har)", Email: "spv_user@interlogs.pln.co.id", NIK: "3216000000000004", RoleCode: "SPV_USER", StructCode: "RENDAL_HAR", Phone: "08123456783", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "staff_user", Name: "Dimas Anggara (Staff Enjiniring)", Email: "staff_user@interlogs.pln.co.id", NIK: "3216000000000005", RoleCode: "STAFF_USER", StructCode: "RENDAL_HAR", Phone: "08123456784", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "mgr_logistik", Name: "Agus Setiawan (Manager Logistik)", Email: "mgr_logistik@interlogs.pln.co.id", NIK: "3216000000000006", RoleCode: "MGR_LOGISTIK", StructCode: "BIDANG_LOGISTIK", Phone: "08123456785", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "spv_inventory", Name: "Fajar Nugroho (Supervisor Inventory Control)", Email: "spv_inventory@interlogs.pln.co.id", NIK: "3216000000000007", RoleCode: "SPV_INVENTORY", StructCode: "PERENCANAAN_PENGADAAN", Phone: "08123456786", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "staff_inventory", Name: "Ilham Ramadhan (Staff Kataloger & Perencana)", Email: "staff_inventory@interlogs.pln.co.id", NIK: "3216000000000008", RoleCode: "STAFF_INVENTORY", StructCode: "PERENCANAAN_PENGADAAN", Phone: "08123456787", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "spv_pengadaan", Name: "Bambang Haryanto (Supervisor Pelaksana Pengadaan)", Email: "spv_pengadaan@interlogs.pln.co.id", NIK: "3216000000000009", RoleCode: "SPV_PENGADAAN", StructCode: "PELAKSANA_PENGADAAN", Phone: "08123456788", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "staff_pengadaan", Name: "Siti Rahmawati (Buyer / Staff Pengadaan)", Email: "staff_pengadaan@interlogs.pln.co.id", NIK: "3216000000000010", RoleCode: "STAFF_PENGADAAN", StructCode: "PELAKSANA_PENGADAAN", Phone: "08123456789", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "spv_gudang", Name: "Eko Prasetyo (Supervisor Administrasi Gudang)", Email: "spv_gudang@interlogs.pln.co.id", NIK: "3216000000000011", RoleCode: "SPV_GUDANG", StructCode: "GUDANG", Phone: "08123456790", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "staff_gudang", Name: "Joko Susilo (Staff Penerimaan Barang Gudang)", Email: "staff_gudang@interlogs.pln.co.id", NIK: "3216000000000012", RoleCode: "STAFF_GUDANG", StructCode: "GUDANG", Phone: "08123456791", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "mgr_keuangan", Name: "Sri Wahyuni (Manager Keuangan)", Email: "mgr_keuangan@interlogs.pln.co.id", NIK: "3216000000000013", RoleCode: "MGR_KEUANGAN", StructCode: "BIDANG_KEUANGAN", Phone: "08123456792", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "spv_keuangan", Name: "Rina Agustina (Supervisor Anggaran & Keuangan)", Email: "spv_keuangan@interlogs.pln.co.id", NIK: "3216000000000014", RoleCode: "SPV_KEUANGAN", StructCode: "BIDANG_KEUANGAN", Phone: "08123456793", Address: "UP Sembalang, Lampung", UserType: "USER"},
		{NID: "staff_keuangan", Name: "Bayu Kurniawan (Staff Keuangan)", Email: "staff_keuangan@interlogs.pln.co.id", NIK: "3216000000000015", RoleCode: "STAFF_KEUANGAN", StructCode: "BIDANG_KEUANGAN", Phone: "08123456794", Address: "UP Sembalang, Lampung", UserType: "USER"},
	}

	hashedPassword, _ := helper.HashPassword("Password123!")
	hashedAdminPassword, _ := helper.HashPassword("admin")

	for _, uData := range defaultUsers {
		var existing user.User
		if err := db.Where("nid = ?", uData.NID).First(&existing).Error; err != nil {
			var r role.Role
			_ = db.Where("code = ?", uData.RoleCode).First(&r)

			var s structure.Structure
			_ = db.Where("code = ?", uData.StructCode).First(&s)

			pwd := hashedPassword
			if uData.NID == "admin" {
				pwd = hashedAdminPassword
			}

			var sID *uuid.UUID
			if s.ID != uuid.Nil {
				sID = &s.ID
			}

			newUser := user.User{
				ID:          uuid.New(),
				NID:         uData.NID,
				Name:        uData.Name,
				Email:       uData.Email,
				NIK:         uData.NIK,
				Password:    pwd,
				RoleID:      r.ID,
				StructureID: sID,
				Phone:       uData.Phone,
				Address:     uData.Address,
				UserType:    uData.UserType,
				IsActive:    true,
			}
			if err := db.Create(&newUser).Error; err != nil {
				log.Printf("Failed to seed user %s: %v\n", uData.NID, err)
			} else {
				log.Printf("Seeded user %s for role %s\n", uData.NID, uData.RoleCode)
			}
		}
	}

	// 4. Seed Master General Defaults
	var genCount int64
	db.Model(&general.General{}).Count(&genCount)
	if genCount == 0 {
		log.Println("Seeding default general categories...")
		generals := []general.General{
			// SUMBER_DANA
			{Group: "SUMBER_DANA", Description: "AI (Anggaran Investasi)"},
			{Group: "SUMBER_DANA", Description: "AO (Anggaran Operasi)"},
			// ENTITAS
			{Group: "ENTITAS", Description: "ET (Enjiniring & QA)"},
			{Group: "ENTITAS", Description: "CNG PLANT"},
			{Group: "ENTITAS", Description: "BLOK 1 UNIT ST"},
			{Group: "ENTITAS", Description: "BLOK 1 UNIT GT 1"},
			{Group: "ENTITAS", Description: "BLOK 1 UNIT GT 2"},
			{Group: "ENTITAS", Description: "BLOK 3.4.5"},
			{Group: "ENTITAS", Description: "UNIT COMMON"},
			// SIFAT_PEKERJAAN
			{Group: "SIFAT_PEKERJAAN", Description: "NORMAL"},
			{Group: "SIFAT_PEKERJAAN", Description: "PENTING"},
			{Group: "SIFAT_PEKERJAAN", Description: "URGENT"},
			{Group: "SIFAT_PEKERJAAN", Description: "EMERGENCY"},
			// JENIS_PEKERJAAN
			{Group: "JENIS_PEKERJAAN", Description: "ROUTINE MAINTENANCE"},
			{Group: "JENIS_PEKERJAAN", Description: "PERIODIC INSPECTION"},
			{Group: "JENIS_PEKERJAAN", Description: "COMBUSTION INSPECTION"},
			{Group: "JENIS_PEKERJAAN", Description: "MAJOR OVERHAUL"},
			{Group: "JENIS_PEKERJAAN", Description: "PENGADAAN BARANG HABIS PAKAI"},
			// GUDANG
			{Group: "GUDANG", Description: "GUDANG UTAMA GMT1"},
			{Group: "GUDANG", Description: "GUDANG TRANSIT GMT2"},
			{Group: "GUDANG", Description: "GUDANG KIMIA"},
			// SYARAT_UMUM
			{Group: "SYARAT_UMUM", Description: "Surat Jalan / Surat Pengantar Barang (3 rangkap)"},
			{Group: "SYARAT_UMUM", Description: "Surat Garansi Barang / Jasa"},
			{Group: "SYARAT_UMUM", Description: "Surat Keaslian Barang (Certificate of Origin)"},
			// SYARAT_KHUSUS
			{Group: "SYARAT_KHUSUS", Description: "Mill Test Certificate"},
			{Group: "SYARAT_KHUSUS", Description: "Sertifikat Kalibrasi Pabrikan"},
		}
		for i := range generals {
			generals[i].ID = uuid.New()
			generals[i].Status = "ACTIVE"
			_ = db.Create(&generals[i])
		}
	}
}

