package character

// LadderEntry represents a single entry in the Fate Ladder.
type LadderEntry struct {
	Rating int    `json:"rating"`
	Label  string `json:"label"`
}

// FateLadder returns the complete Fate Ladder from Legendary (+8) to Terrible (-2).
func FateLadder() []LadderEntry {
	return []LadderEntry{
		{Rating: 8, Label: "Legendary"},
		{Rating: 7, Label: "Epic"},
		{Rating: 6, Label: "Fantastic"},
		{Rating: 5, Label: "Superb"},
		{Rating: 4, Label: "Great"},
		{Rating: 3, Label: "Good"},
		{Rating: 2, Label: "Fair"},
		{Rating: 1, Label: "Average"},
		{Rating: 0, Label: "Mediocre"},
		{Rating: -1, Label: "Poor"},
		{Rating: -2, Label: "Terrible"},
	}
}

// DefaultSkillNames returns the 18 SRD skill names in alphabetical order.
func DefaultSkillNames() []string {
	return []string{
		"Athletics", "Burglary", "Contacts", "Crafts", "Deceive", "Drive",
		"Empathy", "Fight", "Investigate", "Lore", "Notice", "Physique",
		"Provoke", "Rapport", "Resources", "Shoot", "Stealth", "Will",
	}
}

// DefaultAspectLabels returns the 5 default aspect labels.
func DefaultAspectLabels() []string {
	return []string{"High Concept", "Trouble", "Relationship", "", ""}
}

// DefaultStressTrackNames returns the default stress track names.
func DefaultStressTrackNames() []string {
	return []string{"Physical", "Mental"}
}

// DefaultGameConfig returns the SRD default game configuration.
func DefaultGameConfig() GameConfig {
	return GameConfig{
		SkillNames:       DefaultSkillNames(),
		AspectLabels:     DefaultAspectLabels(),
		StressTrackNames: DefaultStressTrackNames(),
	}
}

// DefaultSkills returns the 18 SRD Fate Core skills at rating 0, in alphabetical order.
func DefaultSkills() []Skill {
	return []Skill{
		{Name: "Athletics"},
		{Name: "Burglary"},
		{Name: "Contacts"},
		{Name: "Crafts"},
		{Name: "Deceive"},
		{Name: "Drive"},
		{Name: "Empathy"},
		{Name: "Fight"},
		{Name: "Investigate"},
		{Name: "Lore"},
		{Name: "Notice"},
		{Name: "Physique"},
		{Name: "Provoke"},
		{Name: "Rapport"},
		{Name: "Resources"},
		{Name: "Shoot"},
		{Name: "Stealth"},
		{Name: "Will"},
	}
}
