package handler

import (
	"crypto/sha256"
	"encoding/hex"
	"net"
	"net/http"
	"strings"
	"time"
)

// this checks the users original IP addr instead proxy IP
func ExtractIP(r *http.Request) string {
	if xrip := r.Header.Get("X-Real-IP"); xrip != "" {
		return strings.TrimSpace(xrip)
	}
	if xff := r.Header.Get("X-Forwarded-for"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

func AnonymizeIP(ipst string) string {
	ip := net.ParseIP(ipst)
	if ip == nil {
		return ipst
	}
	if ipv4 := ip.To4(); ipv4 != nil {
		return net.IPv4(ipv4[0], ipv4[1], ipv4[2], 0).String()
	}
	return ipst
}

func GenerateVisitorHash(ip string, ua string) string {
	today := time.Now().UTC().Format("2006-01-02")
	hash := sha256.Sum256([]byte(ip + ua + today + "linkit-salt"))
	return hex.EncodeToString(hash[:])
}

func DetectBot(ua string) bool {
	lower := strings.ToLower(ua)
	botKeywords := []string{
		"bot", "crawler", "spider", "googlebot", "bingbot",
		"curl", "postman", "wget", "python-requests", "ahrefs",
	}
	for _, kw := range botKeywords {
		if strings.Contains(lower, kw) {
			return true
		}
	}
	return false
}

func ParseUserAgent(ua string) (browser, os, device string) {
	lower := strings.ToLower(ua)

	// Device
	if strings.Contains(lower, "mobile") || strings.Contains(lower, "android") || strings.Contains(lower, "iphone") {
		device = "mobile"
	} else if strings.Contains(lower, "ipad") || strings.Contains(lower, "tablet") {
		device = "tablet"
	} else {
		device = "desktop"
	}

	// Browser
	if strings.Contains(lower, "edg/") {
		browser = "Edge"
	} else if strings.Contains(lower, "chrome/") {
		browser = "Chrome"
	} else if strings.Contains(lower, "safari/") && !strings.Contains(lower, "chrome") {
		browser = "Safari"
	} else if strings.Contains(lower, "firefox/") {
		browser = "Firefox"
	} else {
		browser = "Other"
	}

	// OS
	if strings.Contains(lower, "windows") {
		os = "Windows"
	} else if strings.Contains(lower, "macintosh") || strings.Contains(lower, "mac os") {
		os = "macOS"
	} else if strings.Contains(lower, "linux") {
		os = "Linux"
	} else if strings.Contains(lower, "android") {
		os = "Android"
	} else if strings.Contains(lower, "iphone") || strings.Contains(lower, "ipad") {
		os = "iOS"
	} else {
		os = "Other"
	}
	return browser, os, device
}
