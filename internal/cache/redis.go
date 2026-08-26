package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisCache struct {
	client *redis.Client
}

func NewRedisCache(redisURL string) (*RedisCache, error){
	opt, err := redis.ParseURL(redisURL)
	if err != nil{
		opt = &redis.Options{Addr: redisURL}
	}
	client := redis.NewClient(opt)
	
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	errr := client.Ping(ctx).Err()
	if errr != nil{
		return nil, errr
	}
	return &RedisCache{client: client}, nil
}

func (c *RedisCache) Get(ctx context.Context, key string) (string, error){
	return c.client.Get(ctx, key).Result()
}

func (c *RedisCache) Set(ctx context.Context, key string, val string, ttl time.Duration) (error){
	 return c.client.Set(ctx, key, val, ttl).Err() 
}

func (c *RedisCache) Delete(ctx context.Context, key string) error{
	return c.client.Del(ctx, key).Err()
}

func(c *RedisCache) Close() error{
	return c.client.Close()
}