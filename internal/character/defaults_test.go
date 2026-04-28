package character

import "testing"

func TestDefaultSkills_Returns18Skills(t *testing.T) {
	skills := DefaultSkills()
	if len(skills) != 18 {
		t.Fatalf("DefaultSkills() should return 18 skills, got %d", len(skills))
	}
}

func TestDefaultSkills_AllRatingZero(t *testing.T) {
	for _, s := range DefaultSkills() {
		if s.Rating != 0 {
			t.Errorf("DefaultSkills() skill %q should have rating 0, got %d", s.Name, s.Rating)
		}
	}
}

func TestDefaultSkills_AlphabeticalOrder(t *testing.T) {
	skills := DefaultSkills()
	for i := 1; i < len(skills); i++ {
		if skills[i].Name < skills[i-1].Name {
			t.Errorf("DefaultSkills() not alphabetical: %q comes after %q", skills[i].Name, skills[i-1].Name)
		}
	}
}

func TestDefaultSkills_ContainsExpectedSkills(t *testing.T) {
	skills := DefaultSkills()
	expected := []string{
		"Athletics", "Burglary", "Contacts", "Crafts", "Deceive", "Drive",
		"Empathy", "Fight", "Investigate", "Lore", "Notice", "Physique",
		"Provoke", "Rapport", "Resources", "Shoot", "Stealth", "Will",
	}
	for i, want := range expected {
		if skills[i].Name != want {
			t.Errorf("DefaultSkills()[%d].Name = %q, want %q", i, skills[i].Name, want)
		}
	}
}

func TestFateLadder_HasAllRatings(t *testing.T) {
	ladder := FateLadder()
	// Should have entries from -2 to +8 (11 entries)
	if len(ladder) != 11 {
		t.Fatalf("FateLadder() should have 11 entries, got %d", len(ladder))
	}
}

func TestFateLadder_SpecificEntries(t *testing.T) {
	ladder := FateLadder()
	checks := map[int]string{
		8:  "Legendary",
		5:  "Superb",
		4:  "Great",
		3:  "Good",
		2:  "Fair",
		1:  "Average",
		0:  "Mediocre",
		-1: "Poor",
		-2: "Terrible",
	}
	for _, entry := range ladder {
		if expected, ok := checks[entry.Rating]; ok {
			if entry.Label != expected {
				t.Errorf("Rating %d label = %q, want %q", entry.Rating, entry.Label, expected)
			}
		}
	}
}
