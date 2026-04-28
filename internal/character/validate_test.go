package character

import "testing"

func TestValidateSkillPyramid_ValidPyramid(t *testing.T) {
	skills := []Skill{
		{Name: "Fight", Rating: 4},
		{Name: "Athletics", Rating: 3},
		{Name: "Shoot", Rating: 3},
		{Name: "Physique", Rating: 2},
		{Name: "Will", Rating: 2},
		{Name: "Notice", Rating: 2},
		{Name: "Empathy", Rating: 1},
		{Name: "Rapport", Rating: 1},
		{Name: "Stealth", Rating: 1},
		{Name: "Deceive", Rating: 1},
	}
	warnings := ValidateSkillPyramid(skills, 4)
	if len(warnings) != 0 {
		t.Errorf("Valid pyramid should have no warnings, got: %v", warnings)
	}
}

func TestValidateSkillPyramid_TooManyAtOneLevel(t *testing.T) {
	skills := []Skill{
		{Name: "Fight", Rating: 4},
		{Name: "Shoot", Rating: 4}, // 2 at Great, should be 1
		{Name: "Athletics", Rating: 3},
		{Name: "Physique", Rating: 2},
	}
	warnings := ValidateSkillPyramid(skills, 4)
	if len(warnings) == 0 {
		t.Error("Should warn about too many skills at Great (+4)")
	}
}

func TestValidateSkillPyramid_MissingLevel(t *testing.T) {
	skills := []Skill{
		{Name: "Fight", Rating: 4},
		// No skills at Good (+3) — gap in pyramid
		{Name: "Physique", Rating: 2},
		{Name: "Will", Rating: 2},
		{Name: "Notice", Rating: 2},
	}
	warnings := ValidateSkillPyramid(skills, 4)
	if len(warnings) == 0 {
		t.Error("Should warn about missing skills at Good (+3)")
	}
}

func TestValidateSkillPyramid_AllZero(t *testing.T) {
	skills := DefaultSkills() // all at 0
	warnings := ValidateSkillPyramid(skills, 4)
	// All at zero is a valid state (character hasn't been built yet)
	if len(warnings) != 0 {
		t.Errorf("All-zero skills should have no warnings, got: %v", warnings)
	}
}

func TestValidateSkillPyramid_ExceedsCap(t *testing.T) {
	skills := []Skill{
		{Name: "Fight", Rating: 5}, // exceeds cap of 4
	}
	warnings := ValidateSkillPyramid(skills, 4)
	if len(warnings) == 0 {
		t.Error("Should warn about skill exceeding cap")
	}
}

func TestCalculateRefresh_3Stunts(t *testing.T) {
	stunts := make([]Stunt, 3)
	if got := CalculateRefresh(3, stunts); got != 3 {
		t.Errorf("CalculateRefresh(3, 3 stunts) = %d, want 3", got)
	}
}

func TestCalculateRefresh_5Stunts(t *testing.T) {
	stunts := make([]Stunt, 5)
	if got := CalculateRefresh(3, stunts); got != 1 {
		t.Errorf("CalculateRefresh(3, 5 stunts) = %d, want 1", got)
	}
}

func TestCalculateRefresh_0Stunts(t *testing.T) {
	if got := CalculateRefresh(3, nil); got != 3 {
		t.Errorf("CalculateRefresh(3, 0 stunts) = %d, want 3", got)
	}
}

func TestCalculateRefresh_NeverBelowOne(t *testing.T) {
	stunts := make([]Stunt, 10)
	if got := CalculateRefresh(3, stunts); got != 1 {
		t.Errorf("CalculateRefresh(3, 10 stunts) = %d, want 1 (minimum)", got)
	}
}

func TestCalculateRefresh_HigherBase(t *testing.T) {
	stunts := make([]Stunt, 5)
	if got := CalculateRefresh(5, stunts); got != 3 {
		t.Errorf("CalculateRefresh(5, 5 stunts) = %d, want 3", got)
	}
}

func TestCalculateStressBoxes_NoSkill(t *testing.T) {
	skills := DefaultSkills() // all at 0
	if got := CalculateStressBoxes(skills, "Physical"); got != 2 {
		t.Errorf("No Physique skill → %d boxes, want 2", got)
	}
}

func TestCalculateStressBoxes_FairPhysique(t *testing.T) {
	skills := []Skill{{Name: "Physique", Rating: 2}}
	if got := CalculateStressBoxes(skills, "Physical"); got != 3 {
		t.Errorf("Fair (+2) Physique → %d boxes, want 3", got)
	}
}

func TestCalculateStressBoxes_GoodPhysique(t *testing.T) {
	skills := []Skill{{Name: "Physique", Rating: 3}}
	if got := CalculateStressBoxes(skills, "Physical"); got != 3 {
		t.Errorf("Good (+3) Physique → %d boxes, want 3", got)
	}
}

func TestCalculateStressBoxes_SuperbPhysique(t *testing.T) {
	skills := []Skill{{Name: "Physique", Rating: 5}}
	if got := CalculateStressBoxes(skills, "Physical"); got != 4 {
		t.Errorf("Superb (+5) Physique → %d boxes, want 4", got)
	}
}

func TestCalculateStressBoxes_FairWill(t *testing.T) {
	skills := []Skill{{Name: "Will", Rating: 2}}
	if got := CalculateStressBoxes(skills, "Mental"); got != 3 {
		t.Errorf("Fair (+2) Will → %d boxes, want 3", got)
	}
}

func TestCalculateStressBoxes_SuperbWill(t *testing.T) {
	skills := []Skill{{Name: "Will", Rating: 5}}
	if got := CalculateStressBoxes(skills, "Mental"); got != 4 {
		t.Errorf("Superb (+5) Will → %d boxes, want 4", got)
	}
}

func TestShouldHaveExtraMildConsequence_SuperbPhysique(t *testing.T) {
	skills := []Skill{{Name: "Physique", Rating: 5}}
	if !ShouldHaveExtraMildConsequence(skills, "Physical") {
		t.Error("Superb Physique should grant extra Physical mild consequence")
	}
}

func TestShouldHaveExtraMildConsequence_SuperbWill(t *testing.T) {
	skills := []Skill{{Name: "Will", Rating: 5}}
	if !ShouldHaveExtraMildConsequence(skills, "Mental") {
		t.Error("Superb Will should grant extra Mental mild consequence")
	}
}

func TestShouldHaveExtraMildConsequence_LowPhysique(t *testing.T) {
	skills := []Skill{{Name: "Physique", Rating: 3}}
	if ShouldHaveExtraMildConsequence(skills, "Physical") {
		t.Error("Good Physique should NOT grant extra mild consequence")
	}
}

func TestShouldHaveExtraMildConsequence_NoSkill(t *testing.T) {
	skills := DefaultSkills()
	if ShouldHaveExtraMildConsequence(skills, "Physical") {
		t.Error("No Physique rating should NOT grant extra mild consequence")
	}
}

func TestShouldHaveExtraMildConsequence_LegendaryPhysique(t *testing.T) {
	skills := []Skill{{Name: "Physique", Rating: 8}}
	if !ShouldHaveExtraMildConsequence(skills, "Physical") {
		t.Error("Legendary Physique should grant extra mild consequence")
	}
}

func TestValidateCharacter_ValidDefault(t *testing.T) {
	c := NewCharacter()
	warnings := ValidateCharacter(c)
	if len(warnings) != 0 {
		t.Errorf("Default character should have no warnings, got: %v", warnings)
	}
}

func TestValidateCharacter_BrokenPyramid(t *testing.T) {
	c := NewCharacter()
	c.Skills[0].Rating = 4
	c.Skills[1].Rating = 4 // two at Great
	warnings := ValidateCharacter(c)
	if len(warnings) == 0 {
		t.Error("Should warn about broken pyramid")
	}
}

func TestValidateCharacter_ExtraStuntsReduceRefresh(t *testing.T) {
	c := NewCharacter()
	c.Stunts = make([]Stunt, 5)
	warnings := ValidateCharacter(c)
	found := false
	for _, w := range warnings {
		if w != "" {
			found = true
		}
	}
	// Refresh warning should be present since stunts > 3
	if !found {
		t.Error("Should warn about refresh reduction from extra stunts")
	}
}

func TestValidateCharacter_StressBoxMismatch(t *testing.T) {
	c := NewCharacter()
	// Set Physique to Fair (+2) — should have 3 boxes, but default is 2
	for i := range c.Skills {
		if c.Skills[i].Name == "Physique" {
			c.Skills[i].Rating = 2
			break
		}
	}
	warnings := ValidateCharacter(c)
	found := false
	for _, w := range warnings {
		if w != "" {
			found = true
		}
	}
	if !found {
		t.Error("Should warn about stress box mismatch")
	}
}
