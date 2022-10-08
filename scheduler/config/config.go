package config

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/spf13/viper"
)

type CronConfig struct {
	Enabled bool
	Rule    string
}

type DatabasePoolConfig struct {
	Max int32
}

type DatabaseConfig struct {
	Host     string
	Name     string
	Username string
	Password string
	Pool     DatabasePoolConfig
}

func (c DatabaseConfig) ConnectionString() string {
	return fmt.Sprintf("postgres://%s:%s@%s/%s?pool_max_conns=%d", c.Username, c.Password, c.Host, c.Name, c.Pool.Max)
}

type FMPConfig struct {
	ApiKey string
}

type NewRelicConfig struct {
	License string
}

type Config struct {
	Timezone string
	FullSync CronConfig
	Database DatabaseConfig
	FMP      FMPConfig
	NewRelic NewRelicConfig
}

func getBaseConfig() *Config {
	return &Config{
		Timezone: "Europe/Paris",
		FullSync: CronConfig{
			Enabled: true,
			Rule:    "0 0 0 * * 1,2,3,4,5",
		},
		Database: DatabaseConfig{
			Host:     "localhost:5432",
			Name:     "merlin",
			Username: "postgres",
			Pool: DatabasePoolConfig{
				Max: 50,
			},
		},
	}
}

func getBaseConfigMap() map[string]interface{} {
	baseConfig := getBaseConfig()

	var baseConfigMap map[string]interface{}
	marshaledConfig, err := json.Marshal(baseConfig)
	if err != nil {
		log.Fatalf("error serializing base config: %v", err)
	}
	if err := json.Unmarshal(marshaledConfig, &baseConfigMap); err != nil {
		log.Fatalf("error deserializing base config: %v", err)
	}

	return baseConfigMap
}

var config Config

func New() Config {
	env := os.Getenv("ENV")
	viper.SetConfigName(env)
	viper.SetConfigType("yaml")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	baseConfigMap := getBaseConfigMap()

	for key, value := range baseConfigMap {
		viper.SetDefault(key, value)
	}

	if err := viper.Unmarshal(&config); err != nil {
		log.Fatalf("unable to decode into struct, %v", err)
	}
	return config
}

func Get() Config {
	return config
}
