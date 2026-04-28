package character

import (
	"encoding/json"
	"fmt"
)

// CurrentVersion is the current character data format version.
const CurrentVersion = "1.0"

// supportedVersions lists all versions that FromJSON can parse.
var supportedVersions = map[string]bool{
	"1.0": true,
}

// ToJSON serializes the character to JSON bytes.
func (c *Character) ToJSON() ([]byte, error) {
	return json.Marshal(c)
}

// FromJSON deserializes a character from JSON bytes.
// Missing version defaults to "1.0". Unknown versions return an error.
func FromJSON(data []byte) (*Character, error) {
	var c Character
	if err := json.Unmarshal(data, &c); err != nil {
		return nil, err
	}
	if c.Version == "" {
		c.Version = CurrentVersion
	}
	if !supportedVersions[c.Version] {
		return nil, fmt.Errorf("unsupported character version: %q", c.Version)
	}
	return &c, nil
}
