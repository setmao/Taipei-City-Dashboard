package controllers

import (
	"net/http"

	"TaipeiCityDashboardBE/app/models"

	"github.com/gin-gonic/gin"
)


func GetEmergence(c *gin.Context) {
	emergenceEvents, err := models.GetEmergence()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": emergenceEvents})
}


func GetAirQuality(c *gin.Context) {
	airQualities, err := models.GetAirQuality()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": airQualities})
}


func GetResource(c *gin.Context) {
	resources, err := models.GetResource()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": resources})
}
