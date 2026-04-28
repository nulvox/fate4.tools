package character

import (
	"crypto/rand"
	"fmt"
)

// Aspect represents a named character aspect (e.g., High Concept, Trouble).
type Aspect struct {
	Label string `json:"label"`
	Value string `json:"value"`
}

// Skill represents a character skill with a name and Fate Ladder rating.
type Skill struct {
	Name   string `json:"name"`
	Rating int    `json:"rating"`
}

// Stunt represents a character stunt or special ability.
type Stunt struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// StressTrack represents a stress track (e.g., Physical, Mental).
type StressTrack struct {
	Name  string `json:"name"`
	Boxes []bool `json:"boxes"`
}

// Consequence represents a consequence slot with a severity level.
type Consequence struct {
	Severity string `json:"severity"`
	Shift    int    `json:"shift"`
	Value    string `json:"value"`
}

// GameConfig holds per-character game configuration for homebrew variants.
type GameConfig struct {
	SkillNames       []string `json:"skillNames"`
	AspectLabels     []string `json:"aspectLabels"`
	StressTrackNames []string `json:"stressTrackNames"`
}

// Character represents a Fate Core character sheet.
type Character struct {
	Version      string        `json:"version"`
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Description  string        `json:"description"`
	Aspects      []Aspect      `json:"aspects"`
	Skills       []Skill       `json:"skills"`
	Stunts       []Stunt       `json:"stunts"`
	Stress       []StressTrack `json:"stress"`
	Consequences []Consequence `json:"consequences"`
	Refresh      int           `json:"refresh"`
	FatePoints   int           `json:"fatePoints"`
	Extras       string        `json:"extras"`
	Notes        string        `json:"notes"`
	GameConfig   GameConfig    `json:"gameConfig"`
}

// NewCharacter creates a new character with a unique ID and empty defaults.
func NewCharacter() *Character {
	return &Character{
		Version: "1.0",
		ID:      generateID(),
		Aspects: []Aspect{
			{Label: "High Concept"},
			{Label: "Trouble"},
			{Label: "Relationship"},
			{Label: ""},
			{Label: ""},
		},
		Skills: DefaultSkills(),
		Stunts: make([]Stunt, 3),
		Stress: []StressTrack{
			{Name: "Physical", Boxes: make([]bool, 2)},
			{Name: "Mental", Boxes: make([]bool, 2)},
		},
		Consequences: []Consequence{
			{Severity: "Mild", Shift: -2},
			{Severity: "Moderate", Shift: -4},
			{Severity: "Severe", Shift: -6},
		},
		Refresh:    3,
		FatePoints: 3,
		GameConfig: DefaultGameConfig(),
	}
}

func generateID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}
