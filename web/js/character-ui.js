"use strict";

var CharacterUI = (function () {

    function renderCharacterHeader(char, container) {
        var section = document.createElement("div");
        section.className = "sheet-section";

        var nameLabel = document.createElement("label");
        nameLabel.textContent = "Name";
        nameLabel.setAttribute("for", "char-name-" + char.id);
        var nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.id = "char-name-" + char.id;
        nameInput.value = char.name;
        nameInput.placeholder = "Character Name";
        nameInput.addEventListener("input", function () {
            char.name = nameInput.value;
            TabManager.renameTab(char.id, char.name || "Unnamed");
            saveCharacter(char);
        });

        var descLabel = document.createElement("label");
        descLabel.textContent = "Description";
        descLabel.setAttribute("for", "char-desc-" + char.id);
        var descInput = document.createElement("textarea");
        descInput.id = "char-desc-" + char.id;
        descInput.value = char.description;
        descInput.placeholder = "Character description…";
        descInput.addEventListener("input", function () {
            char.description = descInput.value;
            saveCharacter(char);
        });

        section.appendChild(nameLabel);
        section.appendChild(nameInput);
        section.appendChild(descLabel);
        section.appendChild(descInput);
        container.appendChild(section);
    }

    function saveCharacter(char) {
        var jsonStr = JSON.stringify(char);
        var result = updateCharacter(jsonStr);
        var parsed = JSON.parse(result);
        if (parsed.error) {
            console.error("updateCharacter error:", parsed.error);
            return;
        }
        var updated = JSON.parse(parsed.character);
        // Merge updated fields back
        Object.assign(char, updated);
        characters[char.id] = char;

        // Persist to localStorage
        Storage.saveCharacter(char);

        // Update warnings panel if it exists
        var warningsDiv = document.getElementById("warnings");
        if (warningsDiv) {
            warningsDiv.innerHTML = "";
            var warnings = parsed.warnings || [];
            if (warnings.length > 0) {
                var ul = document.createElement("ul");
                warnings.forEach(function (w) {
                    var li = document.createElement("li");
                    li.textContent = w;
                    ul.appendChild(li);
                });
                warningsDiv.appendChild(ul);
            }
        }
    }

    function renderAspects(char, container) {
        var section = document.createElement("div");
        section.className = "sheet-section";
        var heading = document.createElement("h2");
        heading.textContent = "Aspects";
        section.appendChild(heading);

        char.aspects.forEach(function (aspect, i) {
            var row = document.createElement("div");
            row.className = "aspect-row";

            var labelInput = document.createElement("input");
            labelInput.type = "text";
            labelInput.className = "aspect-label";
            labelInput.value = aspect.label;
            labelInput.placeholder = "Label";
            labelInput.addEventListener("input", function () {
                char.aspects[i].label = labelInput.value;
                saveCharacter(char);
            });

            var valueInput = document.createElement("input");
            valueInput.type = "text";
            valueInput.className = "aspect-value";
            valueInput.value = aspect.value;
            valueInput.placeholder = aspect.label || "Aspect " + (i + 1);
            valueInput.addEventListener("input", function () {
                char.aspects[i].value = valueInput.value;
                saveCharacter(char);
            });

            row.appendChild(labelInput);
            row.appendChild(valueInput);
            section.appendChild(row);
        });

        container.appendChild(section);
    }

    function buildRatingSelect(currentRating, onChange) {
        var select = document.createElement("select");
        var ladder = JSON.parse(getFateLadder());
        ladder.forEach(function (entry) {
            var opt = document.createElement("option");
            opt.value = entry.rating;
            opt.textContent = "+" + entry.rating + " " + entry.label;
            if (entry.rating < 0) {
                opt.textContent = entry.rating + " " + entry.label;
            }
            if (entry.rating === currentRating) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
        select.addEventListener("change", function () {
            onChange(parseInt(select.value, 10));
        });
        return select;
    }

    function renderSkills(char, container) {
        var section = document.createElement("div");
        section.className = "sheet-section";
        var heading = document.createElement("h2");
        heading.textContent = "Skills";
        section.appendChild(heading);

        var skillsContainer = document.createElement("div");
        skillsContainer.id = "skills-list";

        function rebuildSkills() {
            skillsContainer.innerHTML = "";
            char.skills.forEach(function (skill, i) {
                var row = document.createElement("div");
                row.className = "skill-row";

                var nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.value = skill.name;
                nameInput.placeholder = "Skill name";
                nameInput.addEventListener("input", function () {
                    char.skills[i].name = nameInput.value;
                    saveCharacter(char);
                });

                var ratingSelect = buildRatingSelect(skill.rating, function (val) {
                    char.skills[i].rating = val;
                    saveCharacter(char);
                });

                var removeBtn = document.createElement("button");
                removeBtn.className = "btn btn-danger btn-small";
                removeBtn.textContent = "\u00d7";
                removeBtn.title = "Remove skill";
                removeBtn.addEventListener("click", function () {
                    char.skills.splice(i, 1);
                    saveCharacter(char);
                    rebuildSkills();
                });

                var upBtn = document.createElement("button");
                upBtn.className = "btn btn-small";
                upBtn.textContent = "\u25b2";
                upBtn.title = "Move up";
                upBtn.disabled = (i === 0);
                upBtn.addEventListener("click", function () {
                    var tmp = char.skills[i];
                    char.skills[i] = char.skills[i - 1];
                    char.skills[i - 1] = tmp;
                    saveCharacter(char);
                    rebuildSkills();
                });

                var downBtn = document.createElement("button");
                downBtn.className = "btn btn-small";
                downBtn.textContent = "\u25bc";
                downBtn.title = "Move down";
                downBtn.disabled = (i === char.skills.length - 1);
                downBtn.addEventListener("click", function () {
                    var tmp = char.skills[i];
                    char.skills[i] = char.skills[i + 1];
                    char.skills[i + 1] = tmp;
                    saveCharacter(char);
                    rebuildSkills();
                });

                row.appendChild(nameInput);
                row.appendChild(ratingSelect);
                row.appendChild(upBtn);
                row.appendChild(downBtn);
                row.appendChild(removeBtn);
                skillsContainer.appendChild(row);
            });
        }

        rebuildSkills();
        section.appendChild(skillsContainer);

        var addBtn = document.createElement("button");
        addBtn.className = "btn btn-small";
        addBtn.textContent = "+ Add Skill";
        addBtn.addEventListener("click", function () {
            char.skills.push({ name: "", rating: 0 });
            saveCharacter(char);
            rebuildSkills();
        });
        section.appendChild(addBtn);

        container.appendChild(section);
    }

    function renderStunts(char, container) {
        var section = document.createElement("div");
        section.className = "sheet-section";
        var heading = document.createElement("h2");
        heading.textContent = "Stunts & Refresh";
        section.appendChild(heading);

        var refreshInfo = document.createElement("div");
        refreshInfo.style.marginBottom = "0.75rem";
        refreshInfo.style.fontSize = "0.9rem";

        function updateRefreshDisplay() {
            var effective = char.refresh;
            var extra = char.stunts.length - 3;
            if (extra > 0) {
                effective = Math.max(1, char.refresh - extra);
            }
            refreshInfo.textContent = "Refresh: " + effective +
                " (base " + char.refresh + ", " + char.stunts.length + " stunts)";
        }

        updateRefreshDisplay();
        section.appendChild(refreshInfo);

        var stuntsContainer = document.createElement("div");

        function rebuildStunts() {
            stuntsContainer.innerHTML = "";
            char.stunts.forEach(function (stunt, i) {
                var row = document.createElement("div");
                row.className = "stunt-row";

                var nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.value = stunt.name;
                nameInput.placeholder = "Stunt name";
                nameInput.addEventListener("input", function () {
                    char.stunts[i].name = nameInput.value;
                    saveCharacter(char);
                });

                var descInput = document.createElement("textarea");
                descInput.value = stunt.description;
                descInput.placeholder = "Stunt description…";
                descInput.rows = 2;
                descInput.addEventListener("input", function () {
                    char.stunts[i].description = descInput.value;
                    saveCharacter(char);
                });

                var removeBtn = document.createElement("button");
                removeBtn.className = "btn btn-danger btn-small";
                removeBtn.textContent = "\u00d7 Remove";
                removeBtn.addEventListener("click", function () {
                    char.stunts.splice(i, 1);
                    saveCharacter(char);
                    rebuildStunts();
                    updateRefreshDisplay();
                });

                row.appendChild(nameInput);
                row.appendChild(descInput);
                row.appendChild(removeBtn);
                stuntsContainer.appendChild(row);
            });
        }

        rebuildStunts();
        section.appendChild(stuntsContainer);

        var addBtn = document.createElement("button");
        addBtn.className = "btn btn-small";
        addBtn.textContent = "+ Add Stunt";
        addBtn.addEventListener("click", function () {
            char.stunts.push({ name: "", description: "" });
            saveCharacter(char);
            rebuildStunts();
            updateRefreshDisplay();
        });
        section.appendChild(addBtn);

        container.appendChild(section);
    }

    function renderStress(char, container) {
        var section = document.createElement("div");
        section.className = "sheet-section";
        var heading = document.createElement("h2");
        heading.textContent = "Stress";
        section.appendChild(heading);

        char.stress.forEach(function (track, ti) {
            var trackDiv = document.createElement("div");
            trackDiv.className = "stress-track";

            var trackLabel = document.createElement("label");
            trackLabel.textContent = track.name;
            trackDiv.appendChild(trackLabel);

            var boxesDiv = document.createElement("div");
            boxesDiv.className = "stress-boxes";

            track.boxes.forEach(function (checked, bi) {
                var box = document.createElement("button");
                box.className = "stress-box" + (checked ? " checked" : "");
                box.textContent = checked ? "\u2717" : (bi + 1);
                box.addEventListener("click", function () {
                    char.stress[ti].boxes[bi] = !char.stress[ti].boxes[bi];
                    saveCharacter(char);
                    box.className = "stress-box" + (char.stress[ti].boxes[bi] ? " checked" : "");
                    box.textContent = char.stress[ti].boxes[bi] ? "\u2717" : (bi + 1);
                });
                boxesDiv.appendChild(box);
            });

            trackDiv.appendChild(boxesDiv);
            section.appendChild(trackDiv);
        });

        container.appendChild(section);
    }

    function renderConsequences(char, container) {
        var section = document.createElement("div");
        section.className = "sheet-section";
        var heading = document.createElement("h2");
        heading.textContent = "Consequences";
        section.appendChild(heading);

        char.consequences.forEach(function (cons, i) {
            var row = document.createElement("div");
            row.className = "consequence-row";

            var label = document.createElement("span");
            label.className = "consequence-label";
            label.textContent = cons.severity + " (" + cons.shift + ")";

            var valueInput = document.createElement("input");
            valueInput.type = "text";
            valueInput.value = cons.value;
            valueInput.placeholder = cons.severity + " consequence…";
            valueInput.addEventListener("input", function () {
                char.consequences[i].value = valueInput.value;
                saveCharacter(char);
            });

            row.appendChild(label);
            row.appendChild(valueInput);
            section.appendChild(row);
        });

        container.appendChild(section);
    }

    function renderExtrasAndNotes(char, container) {
        var section = document.createElement("div");
        section.className = "sheet-section";
        var heading = document.createElement("h2");
        heading.textContent = "Extras & Notes";
        section.appendChild(heading);

        var extrasLabel = document.createElement("label");
        extrasLabel.textContent = "Extras";
        var extrasInput = document.createElement("textarea");
        extrasInput.value = char.extras;
        extrasInput.placeholder = "Equipment, special items, powers…";
        extrasInput.rows = 4;
        extrasInput.addEventListener("input", function () {
            char.extras = extrasInput.value;
            saveCharacter(char);
        });

        var notesLabel = document.createElement("label");
        notesLabel.textContent = "Notes";
        var notesInput = document.createElement("textarea");
        notesInput.value = char.notes;
        notesInput.placeholder = "Session notes, reminders…";
        notesInput.rows = 4;
        notesInput.addEventListener("input", function () {
            char.notes = notesInput.value;
            saveCharacter(char);
        });

        section.appendChild(extrasLabel);
        section.appendChild(extrasInput);
        section.appendChild(notesLabel);
        section.appendChild(notesInput);
        container.appendChild(section);
    }

    function renderValidationWarnings(char, container) {
        var warningsDiv = document.createElement("div");
        warningsDiv.id = "warnings";

        function updateWarnings() {
            warningsDiv.innerHTML = "";
            var result = validateCharacter(JSON.stringify(char));
            var warnings = JSON.parse(result);
            if (warnings && warnings.length > 0) {
                var ul = document.createElement("ul");
                warnings.forEach(function (w) {
                    var li = document.createElement("li");
                    li.textContent = w;
                    ul.appendChild(li);
                });
                warningsDiv.appendChild(ul);
            }
        }

        updateWarnings();
        container.appendChild(warningsDiv);

        // Return update function so callers can refresh warnings
        return updateWarnings;
    }

    function renderCharacterSheet(char) {
        var content = document.getElementById("content");
        content.innerHTML = "";
        renderCharacterSheetInto(char, content);
    }

    function renderCharacterSheetInto(char, container) {
        renderValidationWarnings(char, container);
        renderCharacterHeader(char, container);
        renderAspects(char, container);
        renderSkills(char, container);
        renderStunts(char, container);
        renderStress(char, container);
        renderConsequences(char, container);
        renderExtrasAndNotes(char, container);
    }

    return {
        renderCharacterSheet: renderCharacterSheet,
        renderCharacterSheetInto: renderCharacterSheetInto,
        renderCharacterHeader: renderCharacterHeader,
        saveCharacter: saveCharacter
    };
})();
