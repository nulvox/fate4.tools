package character

import (
	"encoding/json"
	"testing"
)

func TestToJSON_ReturnsValidJSON(t *testing.T) {
	c := NewCharacter()
	data, err := c.ToJSON()
	if err != nil {
		t.Fatalf("ToJSON() error: %v", err)
	}
	if len(data) == 0 {
		t.Error("ToJSON() returned empty data")
	}
}

func TestRoundTrip_PreservesAllFields(t *testing.T) {
	original := NewCharacter()
	original.Name = "Test Hero"
	original.Description = "A brave adventurer"
	original.Aspects[0].Value = "The Chosen One"
	original.Skills[0].Rating = 4
	original.Stunts[0].Name = "Combat Reflexes"
	original.Stunts[0].Description = "+2 to Fight when defending"
	original.Stress[0].Boxes[0] = true
	original.Consequences[0].Value = "Bruised Ribs"
	original.Extras = "Magic Sword"
	original.Notes = "Played by Alice"

	data, err := original.ToJSON()
	if err != nil {
		t.Fatalf("ToJSON() error: %v", err)
	}

	restored, err := FromJSON(data)
	if err != nil {
		t.Fatalf("FromJSON() error: %v", err)
	}

	if restored.ID != original.ID {
		t.Errorf("ID = %q, want %q", restored.ID, original.ID)
	}
	if restored.Name != original.Name {
		t.Errorf("Name = %q, want %q", restored.Name, original.Name)
	}
	if restored.Description != original.Description {
		t.Errorf("Description = %q, want %q", restored.Description, original.Description)
	}
	if restored.Aspects[0].Value != original.Aspects[0].Value {
		t.Errorf("Aspects[0].Value = %q, want %q", restored.Aspects[0].Value, original.Aspects[0].Value)
	}
	if restored.Skills[0].Rating != original.Skills[0].Rating {
		t.Errorf("Skills[0].Rating = %d, want %d", restored.Skills[0].Rating, original.Skills[0].Rating)
	}
	if restored.Stunts[0].Name != original.Stunts[0].Name {
		t.Errorf("Stunts[0].Name = %q, want %q", restored.Stunts[0].Name, original.Stunts[0].Name)
	}
	if restored.Stress[0].Boxes[0] != true {
		t.Error("Stress[0].Boxes[0] should be true after round-trip")
	}
	if restored.Consequences[0].Value != original.Consequences[0].Value {
		t.Errorf("Consequences[0].Value = %q, want %q", restored.Consequences[0].Value, original.Consequences[0].Value)
	}
	if restored.Refresh != original.Refresh {
		t.Errorf("Refresh = %d, want %d", restored.Refresh, original.Refresh)
	}
	if restored.FatePoints != original.FatePoints {
		t.Errorf("FatePoints = %d, want %d", restored.FatePoints, original.FatePoints)
	}
	if restored.Extras != original.Extras {
		t.Errorf("Extras = %q, want %q", restored.Extras, original.Extras)
	}
	if restored.Notes != original.Notes {
		t.Errorf("Notes = %q, want %q", restored.Notes, original.Notes)
	}
	if len(restored.GameConfig.SkillNames) != len(original.GameConfig.SkillNames) {
		t.Errorf("GameConfig.SkillNames length = %d, want %d", len(restored.GameConfig.SkillNames), len(original.GameConfig.SkillNames))
	}
}

func TestFromJSON_InvalidJSON(t *testing.T) {
	_, err := FromJSON([]byte("not json"))
	if err == nil {
		t.Error("FromJSON() should return error for invalid JSON")
	}
}

func TestToJSON_IncludesVersion(t *testing.T) {
	c := NewCharacter()
	data, err := c.ToJSON()
	if err != nil {
		t.Fatalf("ToJSON() error: %v", err)
	}

	// Parse the raw JSON to check for version field
	var raw map[string]interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		t.Fatalf("Unmarshal error: %v", err)
	}
	v, ok := raw["version"]
	if !ok {
		t.Fatal("ToJSON() output should include a 'version' field")
	}
	if v != "1.0" {
		t.Errorf("version = %q, want %q", v, "1.0")
	}
}

func TestFromJSON_MissingVersionDefaultsTo1(t *testing.T) {
	// JSON without a version field
	data := []byte(`{"id":"test-id","name":"No Version"}`)
	c, err := FromJSON(data)
	if err != nil {
		t.Fatalf("FromJSON() error: %v", err)
	}
	if c.Version != "1.0" {
		t.Errorf("Version = %q, want %q", c.Version, "1.0")
	}
}

func TestFromJSON_UnknownVersionReturnsError(t *testing.T) {
	data := []byte(`{"version":"99.0","id":"test-id","name":"Future"}`)
	_, err := FromJSON(data)
	if err == nil {
		t.Error("FromJSON() should return error for unknown version")
	}
}

func TestFromJSON_KnownVersionSucceeds(t *testing.T) {
	data := []byte(`{"version":"1.0","id":"test-id","name":"Valid"}`)
	c, err := FromJSON(data)
	if err != nil {
		t.Fatalf("FromJSON() error: %v", err)
	}
	if c.Name != "Valid" {
		t.Errorf("Name = %q, want %q", c.Name, "Valid")
	}
}

func TestRoundTrip_EmptyStrings(t *testing.T) {
	c := NewCharacter()
	c.Name = ""
	c.Description = ""
	c.Extras = ""
	c.Notes = ""

	data, err := c.ToJSON()
	if err != nil {
		t.Fatalf("ToJSON() error: %v", err)
	}
	restored, err := FromJSON(data)
	if err != nil {
		t.Fatalf("FromJSON() error: %v", err)
	}
	if restored.Name != "" {
		t.Errorf("Name should be empty, got %q", restored.Name)
	}
}

func TestRoundTrip_EmptySkillList(t *testing.T) {
	c := NewCharacter()
	c.Skills = []Skill{}

	data, err := c.ToJSON()
	if err != nil {
		t.Fatalf("ToJSON() error: %v", err)
	}
	restored, err := FromJSON(data)
	if err != nil {
		t.Fatalf("FromJSON() error: %v", err)
	}
	if len(restored.Skills) != 0 {
		t.Errorf("Skills should be empty, got %d", len(restored.Skills))
	}
}

func TestRoundTrip_UnicodeCharacters(t *testing.T) {
	c := NewCharacter()
	c.Name = "ファイター" // Japanese
	c.Description = "Un héros très brave — «Le Champion»"
	c.Aspects[0].Value = "🔥 The Chosen One 🔥"
	c.Notes = "Ñoño plays this character\n\twith émojis 🎲"

	data, err := c.ToJSON()
	if err != nil {
		t.Fatalf("ToJSON() error: %v", err)
	}
	restored, err := FromJSON(data)
	if err != nil {
		t.Fatalf("FromJSON() error: %v", err)
	}
	if restored.Name != c.Name {
		t.Errorf("Name = %q, want %q", restored.Name, c.Name)
	}
	if restored.Description != c.Description {
		t.Errorf("Description = %q, want %q", restored.Description, c.Description)
	}
	if restored.Aspects[0].Value != c.Aspects[0].Value {
		t.Errorf("Aspect value = %q, want %q", restored.Aspects[0].Value, c.Aspects[0].Value)
	}
	if restored.Notes != c.Notes {
		t.Errorf("Notes = %q, want %q", restored.Notes, c.Notes)
	}
}

func TestRoundTrip_LongStrings(t *testing.T) {
	c := NewCharacter()
	// Create a long string (10KB)
	long := make([]byte, 10000)
	for i := range long {
		long[i] = 'a' + byte(i%26)
	}
	c.Notes = string(long)
	c.Extras = string(long)

	data, err := c.ToJSON()
	if err != nil {
		t.Fatalf("ToJSON() error: %v", err)
	}
	restored, err := FromJSON(data)
	if err != nil {
		t.Fatalf("FromJSON() error: %v", err)
	}
	if restored.Notes != c.Notes {
		t.Error("Long Notes string not preserved")
	}
	if restored.Extras != c.Extras {
		t.Error("Long Extras string not preserved")
	}
}
