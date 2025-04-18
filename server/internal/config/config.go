package config

import (
	"bytes"
	_ "embed"
	"strings"

	"github.com/spf13/viper"
)

//go:embed config_template.yaml
var configTemplate []byte

type Config struct {
	Port           int    `mapstructure:"port"`
	SqliteFilename string `mapstructure:"sqlite_filename"`
}

func Load() (*Config, error) {
	viper.SetEnvPrefix("APP")
	viper.AutomaticEnv()

	viper.SetConfigType("yaml")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	if err := viper.ReadConfig(bytes.NewReader(configTemplate)); err != nil {
		return nil, err
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
