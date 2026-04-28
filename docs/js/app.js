"use strict";

// Character data store, keyed by character ID.
var characters = {};
var splitMode = false;
var splitSelections = { left: null, right: null };

async function initWasm() {
    var go = new Go();
    var result = await WebAssembly.instantiateStreaming(
        fetch("main.wasm"),
        go.importObject
    );
    go.run(result.instance);

    document.getElementById("loading").style.display = "none";
    document.getElementById("app").style.display = "block";

    // Wire up the new-tab button
    document.getElementById("new-tab-btn").addEventListener("click", function () {
        newCharacterTab();
    });

    // Wire up print button
    document.getElementById("print-btn").addEventListener("click", function () {
        window.print();
    });

    // Wire up split view toggle
    document.getElementById("split-btn").addEventListener("click", function () {
        toggleSplitView();
    });

    // Wire up export button
    document.getElementById("export-btn").addEventListener("click", function () {
        var id = TabManager.getActiveTabId();
        if (id && characters[id]) {
            ImportExport.exportJSON(characters[id]);
        }
    });

    // Wire up import button
    document.getElementById("import-btn").addEventListener("click", function () {
        ImportExport.importJSON(function (char) {
            characters[char.id] = char;
            Storage.saveCharacter(char);
            TabManager.createTab(char.id, char.name || "Unnamed");
        });
    });

    // Wire up share button
    document.getElementById("share-btn").addEventListener("click", function () {
        var id = TabManager.getActiveTabId();
        if (id && characters[id]) {
            Share.shareCharacter(characters[id]);
        }
    });

    // Initialize theme toggle
    Theme.init();

    // Wire up tab rename callback — update character name when tab is renamed via double-click
    TabManager.onRename = function (id, newName) {
        if (characters[id]) {
            characters[id].name = newName;
            CharacterUI.saveCharacter(characters[id]);
        }
    };

    // Wire up empty state callback
    TabManager.onEmpty = function () {
        showEmptyState();
    };

    // Check for shared character in URL hash
    var sharedChar = Share.loadFromHash();
    if (sharedChar) {
        // Give it a new ID so it doesn't collide with existing characters
        var imported = JSON.parse(importCharacter(JSON.stringify(sharedChar)));
        if (!imported.error) {
            var char = JSON.parse(imported.character);
            characters[char.id] = char;
            Storage.saveCharacter(char);
            TabManager.createTab(char.id, char.name || "Unnamed");
            // Clear hash so refreshing doesn't re-import
            history.replaceState(null, "", window.location.pathname);
        }
    }

    // Restore saved characters from localStorage
    restoreCharacters();

    // If no characters were restored, show empty state
    if (TabManager.getAllTabs().length === 0) {
        showEmptyState();
    }
}

function showEmptyState() {
    var content = document.getElementById("content");
    content.innerHTML = "";

    var empty = document.createElement("div");
    empty.className = "empty-state";

    var heading = document.createElement("h2");
    heading.textContent = "Welcome to Fate4.tools";

    var desc = document.createElement("p");
    desc.textContent = "Create and manage character sheets for Fate Core. Your characters are saved locally in your browser.";

    var createBtn = document.createElement("button");
    createBtn.className = "btn btn-primary";
    createBtn.textContent = "Create Character";
    createBtn.addEventListener("click", function () {
        newCharacterTab();
    });

    empty.appendChild(heading);
    empty.appendChild(desc);
    empty.appendChild(createBtn);
    content.appendChild(empty);

    // Hide export/print/share buttons when no character is active
    var exportBtn = document.getElementById("export-btn");
    var printBtn = document.getElementById("print-btn");
    var shareBtn = document.getElementById("share-btn");
    if (exportBtn) exportBtn.style.display = "none";
    if (printBtn) printBtn.style.display = "none";
    if (shareBtn) shareBtn.style.display = "none";
}

function newCharacterTab() {
    var jsonStr = createCharacter();
    var char = JSON.parse(jsonStr);
    characters[char.id] = char;
    Storage.saveCharacter(char);
    TabManager.createTab(char.id, char.name || "Unnamed");
}

function restoreCharacters() {
    var manifest = Storage.listCharacters();
    manifest.forEach(function (entry) {
        var char = Storage.loadCharacter(entry.id);
        if (char) {
            characters[char.id] = char;
            TabManager.createTab(char.id, char.name || "Unnamed");
        }
    });
}

function toggleSplitView() {
    splitMode = !splitMode;
    var splitContainer = document.getElementById("split-container");
    var content = document.getElementById("content");
    var splitBtn = document.getElementById("split-btn");

    if (splitMode) {
        splitContainer.className = "active";
        splitContainer.style.display = "flex";
        content.style.display = "none";
        splitBtn.textContent = "Single View";
        renderSplitPanes();
    } else {
        splitContainer.className = "";
        splitContainer.style.display = "none";
        content.style.display = "";
        splitBtn.textContent = "Split View";
        // Re-render the active tab
        var id = TabManager.getActiveTabId();
        if (id && characters[id]) {
            CharacterUI.renderCharacterSheet(characters[id]);
        } else {
            showEmptyState();
        }
    }
}

function buildCharacterSelector(pane, side) {
    var selectorDiv = document.createElement("div");
    selectorDiv.className = "split-selector";
    var select = document.createElement("select");

    var defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "— Select character —";
    select.appendChild(defaultOpt);

    var tabs = TabManager.getAllTabs();
    tabs.forEach(function (tab) {
        var opt = document.createElement("option");
        opt.value = tab.id;
        opt.textContent = tab.name;
        if (splitSelections[side] === tab.id) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });

    select.addEventListener("change", function () {
        splitSelections[side] = select.value || null;
        renderSplitPaneContent(pane, splitSelections[side]);
    });

    selectorDiv.appendChild(select);
    return selectorDiv;
}

function renderSplitPaneContent(pane, charId) {
    // Remove everything except the selector
    var children = Array.from(pane.children);
    for (var i = 1; i < children.length; i++) {
        children[i].remove();
    }
    if (charId && characters[charId]) {
        CharacterUI.renderCharacterSheetInto(characters[charId], pane);
    }
}

function renderSplitPanes() {
    var left = document.getElementById("split-left");
    var right = document.getElementById("split-right");
    left.innerHTML = "";
    right.innerHTML = "";

    left.appendChild(buildCharacterSelector(left, "left"));
    right.appendChild(buildCharacterSelector(right, "right"));

    renderSplitPaneContent(left, splitSelections.left);
    renderSplitPaneContent(right, splitSelections.right);
}

// Called when a tab is activated
TabManager.onActivate = function (id) {
    var char = characters[id];
    var exportBtn = document.getElementById("export-btn");
    var printBtn = document.getElementById("print-btn");
    var shareBtn = document.getElementById("share-btn");
    if (char && !splitMode) {
        CharacterUI.renderCharacterSheet(char);
        if (exportBtn) exportBtn.style.display = "";
        if (printBtn) printBtn.style.display = "";
        if (shareBtn) shareBtn.style.display = "";
    } else if (!char) {
        if (exportBtn) exportBtn.style.display = "none";
        if (printBtn) printBtn.style.display = "none";
        if (shareBtn) shareBtn.style.display = "none";
    }
};

initWasm();
