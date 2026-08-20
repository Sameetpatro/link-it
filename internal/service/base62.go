package service

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func encodeBase62(num int) string{
	if num == 0{
		return string(BASE62[0])
	}
	var res[]byte
	for num > 0{
		rem := num %62
		res = append(res, BASE62[rem])
		num = num / 62
	}
	return reverse(res)
}

func reverse(s []byte) string{
	sz := len(s)
	for i := 0; i < len(s) / 2; i++{
		s[i], s[sz - i - 1] = s[sz - i - 1], s[i]
	}
	return string(s)
}