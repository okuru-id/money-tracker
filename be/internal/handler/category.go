package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"money-tracker-be/internal/middleware"
	"money-tracker-be/internal/service"
)

type CategoryHandler struct {
	categorySvc service.CategoryService
}

func NewCategoryHandler(categorySvc service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categorySvc: categorySvc}
}

// List godoc
// @Summary Get categories
// @Description Get list of transaction categories (income/expense)
// @Tags category
// @Produce json
// @Security session
// @Param type query string false "Filter by type (income, expense)"
// @Success 200 {object} map[string][]model.CategoryResponse "List of categories"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /categories [get]
func (h *CategoryHandler) List(c *gin.Context) {
	categoryType := c.Query("type")

	var categories []interface{}

	if categoryType != "" {
		cats, err := h.categorySvc.GetByType(c.Request.Context(), categoryType)
		if err != nil {
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to get categories",
				nil,
			))
			return
		}
		for _, cat := range cats {
			categories = append(categories, gin.H{
				"id":         cat.ID,
				"name":       cat.Name,
				"type":       cat.Type,
				"is_default": cat.IsDefault,
			})
		}
	} else {
		cats, err := h.categorySvc.GetAll(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to get categories",
				nil,
			))
			return
		}
		for _, cat := range cats {
			categories = append(categories, gin.H{
				"id":         cat.ID,
				"name":       cat.Name,
				"type":       cat.Type,
				"is_default": cat.IsDefault,
			})
		}
	}

	if categories == nil {
		categories = []interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}