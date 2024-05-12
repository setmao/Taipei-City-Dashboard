package models

import (
	"time"
)


type Emergence struct {
	Type string `json:"type" gorm:"column:type"`
	Geo string `gorm:"type:json"`
	Name string `json:"name" gorm:"column:name"`
	Status string `json:"status" gorm:"column:status"`
	Dt time.Time `json:"dt" gorm:"column:dt"`
	Suggestion string `json:"suggestion" gorm:"column:suggestion"`
}

type Resource struct {
	Name string `json:"name" gorm:"column:name"`
	Geo string `gorm:"type:json"`
	Type string `json:"type" gorm:"column:type"`
}

type AirQuality struct {
	Name string `json:"name" gorm:"column:name"`
	Geo string `gorm:"type:json"`
	Dt time.Time `json:"dt" gorm:"column:dt"`
	Pollutant string `json:"pollutant" gorm:"column:pollutant"`
	Value int32 `json:"value" gorm:"column:value"`
	Level string `json:"level" gorm:"column:level"`
}


func GetEmergence() (emergence []Emergence, err error) {
	err = DBDashboard.Find(&emergence).Error
	return emergence, err
}

func GetResource() (resources []Resource, err error) {
	err = DBDashboard.Find(&resources).Error
	return resources, err
}

func GetAirQuality() (airQualities []AirQuality, err error) {
	err = DBDashboard.Find(&airQualities).Error
	return airQualities, err
}
