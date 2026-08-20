package model

import "time"

type URL struct{
	Id int `json:"id"`
	Shcode string `json:"shcode"`
	Orglink string `json:"orglink"`
	UserId *int `json:"user_id,omitempty"`
	CreatAt string `json:"createAt"`
}

type UrlClickCount struct{
	Id int `json:"id"`
	Shcode string `json:"shcode"`
	OriginalURL string `json:"original_url"`
	UserId *int `json:"user_id,omitempty"`
	ClickCount int `json:"click_count"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
}