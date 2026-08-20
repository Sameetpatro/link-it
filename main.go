package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("hello")
	http.HandleFunc("/shorten", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "hi")
	})
	err:= http.ListenAndServe(":8080", nil)
	if err != nil{
		fmt.Println("error starting server: ", err)
	}
}
