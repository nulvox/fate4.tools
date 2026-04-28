package character

import "testing"

func TestNewCharacter_HasNonEmptyID(t *testing.T) {
	c := NewCharacter()
	if c.ID == "" {
		t.Error("NewCharacter() should return a character with a non-empty ID")
	}
}

func TestNewCharacter_HasEmptyName(t *testing.T) {
	c := NewCharacter()
	if c.Name != "" {
		t.Errorf("NewCharacter().Name should be empty, got %q", c.Name)
	}
}

func TestNewCharacter_HasEmptyDescription(t *testing.T) {
	c := NewCharacter()
	if c.Description != "" {
		t.Errorf("NewCharacter().Description should be empty, got %q", c.Description)
	}
}

func TestNewCharacter_UniqueIDs(t *testing.T) {
	c1 := NewCharacter()
	c2 := NewCharacter()
	if c1.ID == c2.ID {
		t.Error("Two calls to NewCharacter() should produce different IDs")
	}
}

func TestNewCharacter_HasFiveAspects(t *testing.T) {
	c := NewCharacter()
	if len(c.Aspects) != 5 {
		t.Fatalf("NewCharacter() should have 5 aspects, got %d", len(c.Aspects))
	}
}

func TestNewCharacter_AspectLabels(t *testing.T) {
	c := NewCharacter()
	expected := []string{"High Concept", "Trouble", "Relationship", "", ""}
	for i, want := range expected {
		if c.Aspects[i].Label != want {
			t.Errorf("Aspect[%d].Label = %q, want %q", i, c.Aspects[i].Label, want)
		}
	}
}

func TestNewCharacter_AspectValuesEmpty(t *testing.T) {
	c := NewCharacter()
	for i, a := range c.Aspects {
		if a.Value != "" {
			t.Errorf("Aspect[%d].Value should be empty, got %q", i, a.Value)
		}
	}
}

func TestNewCharacter_Has18Skills(t *testing.T) {
	c := NewCharacter()
	if len(c.Skills) != 18 {
		t.Fatalf("NewCharacter() should have 18 skills, got %d", len(c.Skills))
	}
}

func TestNewCharacter_SkillsAllRatingZero(t *testing.T) {
	c := NewCharacter()
	for _, s := range c.Skills {
		if s.Rating != 0 {
			t.Errorf("NewCharacter() skill %q should have rating 0, got %d", s.Name, s.Rating)
		}
	}
}

func TestNewCharacter_SkillsInAlphabeticalOrder(t *testing.T) {
	c := NewCharacter()
	for i := 1; i < len(c.Skills); i++ {
		if c.Skills[i].Name < c.Skills[i-1].Name {
			t.Errorf("Skills not alphabetical: %q comes after %q", c.Skills[i].Name, c.Skills[i-1].Name)
		}
	}
}

func TestNewCharacter_Has3Stunts(t *testing.T) {
	c := NewCharacter()
	if len(c.Stunts) != 3 {
		t.Fatalf("NewCharacter() should have 3 stunts, got %d", len(c.Stunts))
	}
}

func TestNewCharacter_StuntsAreEmpty(t *testing.T) {
	c := NewCharacter()
	for i, s := range c.Stunts {
		if s.Name != "" {
			t.Errorf("Stunt[%d].Name should be empty, got %q", i, s.Name)
		}
		if s.Description != "" {
			t.Errorf("Stunt[%d].Description should be empty, got %q", i, s.Description)
		}
	}
}

func TestNewCharacter_Has2StressTracks(t *testing.T) {
	c := NewCharacter()
	if len(c.Stress) != 2 {
		t.Fatalf("NewCharacter() should have 2 stress tracks, got %d", len(c.Stress))
	}
}

func TestNewCharacter_StressTrackNames(t *testing.T) {
	c := NewCharacter()
	if c.Stress[0].Name != "Physical" {
		t.Errorf("Stress[0].Name = %q, want %q", c.Stress[0].Name, "Physical")
	}
	if c.Stress[1].Name != "Mental" {
		t.Errorf("Stress[1].Name = %q, want %q", c.Stress[1].Name, "Mental")
	}
}

func TestNewCharacter_StressTracks2BoxesEach(t *testing.T) {
	c := NewCharacter()
	for _, track := range c.Stress {
		if len(track.Boxes) != 2 {
			t.Errorf("Stress track %q should have 2 boxes, got %d", track.Name, len(track.Boxes))
		}
	}
}

func TestNewCharacter_StressBoxesUnchecked(t *testing.T) {
	c := NewCharacter()
	for _, track := range c.Stress {
		for j, checked := range track.Boxes {
			if checked {
				t.Errorf("Stress track %q box %d should be unchecked", track.Name, j)
			}
		}
	}
}

func TestNewCharacter_Has3Consequences(t *testing.T) {
	c := NewCharacter()
	if len(c.Consequences) != 3 {
		t.Fatalf("NewCharacter() should have 3 consequences, got %d", len(c.Consequences))
	}
}

func TestNewCharacter_ConsequenceSeveritiesAndShifts(t *testing.T) {
	c := NewCharacter()
	expected := []struct {
		severity string
		shift    int
	}{
		{"Mild", -2},
		{"Moderate", -4},
		{"Severe", -6},
	}
	for i, want := range expected {
		if c.Consequences[i].Severity != want.severity {
			t.Errorf("Consequence[%d].Severity = %q, want %q", i, c.Consequences[i].Severity, want.severity)
		}
		if c.Consequences[i].Shift != want.shift {
			t.Errorf("Consequence[%d].Shift = %d, want %d", i, c.Consequences[i].Shift, want.shift)
		}
	}
}

func TestNewCharacter_ConsequenceValuesEmpty(t *testing.T) {
	c := NewCharacter()
	for i, cons := range c.Consequences {
		if cons.Value != "" {
			t.Errorf("Consequence[%d].Value should be empty, got %q", i, cons.Value)
		}
	}
}

func TestNewCharacter_RefreshDefault3(t *testing.T) {
	c := NewCharacter()
	if c.Refresh != 3 {
		t.Errorf("NewCharacter().Refresh = %d, want 3", c.Refresh)
	}
}

func TestNewCharacter_FatePointsDefault3(t *testing.T) {
	c := NewCharacter()
	if c.FatePoints != 3 {
		t.Errorf("NewCharacter().FatePoints = %d, want 3", c.FatePoints)
	}
}

func TestNewCharacter_ExtrasEmpty(t *testing.T) {
	c := NewCharacter()
	if c.Extras != "" {
		t.Errorf("NewCharacter().Extras should be empty, got %q", c.Extras)
	}
}

func TestNewCharacter_NotesEmpty(t *testing.T) {
	c := NewCharacter()
	if c.Notes != "" {
		t.Errorf("NewCharacter().Notes should be empty, got %q", c.Notes)
	}
}

func TestNewCharacter_GameConfigSkillNames(t *testing.T) {
	c := NewCharacter()
	if len(c.GameConfig.SkillNames) != 18 {
		t.Fatalf("GameConfig.SkillNames should have 18 entries, got %d", len(c.GameConfig.SkillNames))
	}
	if c.GameConfig.SkillNames[0] != "Athletics" {
		t.Errorf("GameConfig.SkillNames[0] = %q, want %q", c.GameConfig.SkillNames[0], "Athletics")
	}
}

func TestNewCharacter_GameConfigAspectLabels(t *testing.T) {
	c := NewCharacter()
	if len(c.GameConfig.AspectLabels) != 5 {
		t.Fatalf("GameConfig.AspectLabels should have 5 entries, got %d", len(c.GameConfig.AspectLabels))
	}
	expected := []string{"High Concept", "Trouble", "Relationship", "", ""}
	for i, want := range expected {
		if c.GameConfig.AspectLabels[i] != want {
			t.Errorf("GameConfig.AspectLabels[%d] = %q, want %q", i, c.GameConfig.AspectLabels[i], want)
		}
	}
}

func TestNewCharacter_GameConfigStressTrackNames(t *testing.T) {
	c := NewCharacter()
	if len(c.GameConfig.StressTrackNames) != 2 {
		t.Fatalf("GameConfig.StressTrackNames should have 2 entries, got %d", len(c.GameConfig.StressTrackNames))
	}
	if c.GameConfig.StressTrackNames[0] != "Physical" {
		t.Errorf("GameConfig.StressTrackNames[0] = %q, want %q", c.GameConfig.StressTrackNames[0], "Physical")
	}
	if c.GameConfig.StressTrackNames[1] != "Mental" {
		t.Errorf("GameConfig.StressTrackNames[1] = %q, want %q", c.GameConfig.StressTrackNames[1], "Mental")
	}
}
