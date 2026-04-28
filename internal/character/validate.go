package character

import "fmt"

// ValidateSkillPyramid checks whether skills form a valid Fate Core pyramid
// with the given skill cap. Returns a list of warning messages.
// A valid pyramid has N skills at level (cap - N + 1) for each level.
// All skills at rating 0 is considered valid (unbuilt character).
func ValidateSkillPyramid(skills []Skill, cap int) []string {
	var warnings []string

	// Count skills at each rating level
	counts := make(map[int]int)
	hasRatedSkills := false
	for _, s := range skills {
		if s.Rating > 0 {
			counts[s.Rating]++
			hasRatedSkills = true
		}
		if s.Rating > cap {
			warnings = append(warnings, fmt.Sprintf("Skill %q at +%d exceeds cap of +%d", s.Name, s.Rating, cap))
		}
	}

	if !hasRatedSkills {
		return warnings
	}

	// Check pyramid shape: at each level from 1 to cap,
	// the number of skills should equal (cap - level + 1)
	for level := cap; level >= 1; level-- {
		expected := cap - level + 1
		actual := counts[level]
		if actual > expected {
			warnings = append(warnings, fmt.Sprintf("Too many skills at +%d: have %d, pyramid allows %d", level, actual, expected))
		} else if actual < expected {
			warnings = append(warnings, fmt.Sprintf("Not enough skills at +%d: have %d, pyramid expects %d", level, actual, expected))
		}
	}

	return warnings
}

// trackSkillMap maps stress track names to the skill that governs them.
var trackSkillMap = map[string]string{
	"Physical": "Physique",
	"Mental":   "Will",
}

// CalculateStressBoxes returns the number of stress boxes for a given track
// based on the governing skill rating. Base is 2; Fair/Good (+2/+3) adds a
// 3rd box; Superb (+5)+ adds a 4th box.
func CalculateStressBoxes(skills []Skill, trackName string) int {
	skillName := trackSkillMap[trackName]
	rating := 0
	for _, s := range skills {
		if s.Name == skillName {
			rating = s.Rating
			break
		}
	}
	boxes := 2
	if rating >= 2 {
		boxes = 3
	}
	if rating >= 5 {
		boxes = 4
	}
	return boxes
}

// ShouldHaveExtraMildConsequence returns true if the character should have
// an extra Mild consequence slot for the given track. This happens when the
// governing skill (Physique for Physical, Will for Mental) is Superb (+5)+.
func ShouldHaveExtraMildConsequence(skills []Skill, trackName string) bool {
	skillName := trackSkillMap[trackName]
	for _, s := range skills {
		if s.Name == skillName {
			return s.Rating >= 5
		}
	}
	return false
}

// CalculateRefresh returns the effective refresh given a base refresh and
// a list of stunts. Each stunt beyond the first 3 reduces refresh by 1.
// The result is never less than 1.
func CalculateRefresh(baseRefresh int, stunts []Stunt) int {
	extra := len(stunts) - 3
	if extra < 0 {
		extra = 0
	}
	refresh := baseRefresh - extra
	if refresh < 1 {
		refresh = 1
	}
	return refresh
}

// ValidateCharacter runs all validation checks on a character and returns
// a combined list of warning messages.
func ValidateCharacter(c *Character) []string {
	var warnings []string

	// Skill pyramid validation (cap at Great +4)
	warnings = append(warnings, ValidateSkillPyramid(c.Skills, 4)...)

	// Refresh validation
	effectiveRefresh := CalculateRefresh(c.Refresh, c.Stunts)
	if effectiveRefresh < c.Refresh {
		warnings = append(warnings, fmt.Sprintf(
			"Refresh reduced from %d to %d due to %d stunts (3 free, each extra costs 1)",
			c.Refresh, effectiveRefresh, len(c.Stunts)))
	}

	// Stress box validation
	for _, track := range c.Stress {
		expected := CalculateStressBoxes(c.Skills, track.Name)
		if len(track.Boxes) != expected {
			warnings = append(warnings, fmt.Sprintf(
				"%s stress track has %d boxes but should have %d based on skills",
				track.Name, len(track.Boxes), expected))
		}
	}

	// Extra mild consequence validation
	for _, trackName := range []string{"Physical", "Mental"} {
		if ShouldHaveExtraMildConsequence(c.Skills, trackName) {
			mildCount := 0
			for _, cons := range c.Consequences {
				if cons.Severity == "Mild" {
					mildCount++
				}
			}
			if mildCount < 2 {
				warnings = append(warnings, fmt.Sprintf(
					"Skills suggest an extra Mild %s consequence slot", trackName))
			}
		}
	}

	return warnings
}
