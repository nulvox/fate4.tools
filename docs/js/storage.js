"use strict";

var Storage = (function () {
    var PREFIX = "fate4_character_";
    var MANIFEST_KEY = "fate4_manifest";

    function showStorageWarning(msg) {
        var existing = document.getElementById("storage-warning");
        if (existing) existing.remove();

        var banner = document.createElement("div");
        banner.id = "storage-warning";
        banner.style.cssText = "background:#e74c3c;color:#fff;padding:0.5rem 1rem;text-align:center;font-size:0.9rem;";
        banner.textContent = msg;

        var closeBtn = document.createElement("button");
        closeBtn.textContent = "\u00d7";
        closeBtn.style.cssText = "background:none;border:none;color:#fff;font-size:1.2rem;margin-left:1rem;cursor:pointer;";
        closeBtn.addEventListener("click", function () { banner.remove(); });
        banner.appendChild(closeBtn);

        var app = document.getElementById("app");
        if (app && app.firstChild) {
            app.insertBefore(banner, app.firstChild);
        }
    }

    function isAvailable() {
        try {
            var test = "__fate4_test__";
            localStorage.setItem(test, "1");
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    function getManifest() {
        try {
            var data = localStorage.getItem(MANIFEST_KEY);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            return [];
        }
    }

    function setManifest(manifest) {
        try {
            localStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
        } catch (e) {
            showStorageWarning("Could not save character list: storage full or unavailable.");
        }
    }

    function saveCharacter(char) {
        try {
            localStorage.setItem(PREFIX + char.id, JSON.stringify(char));
        } catch (e) {
            showStorageWarning("Could not save character: storage full or unavailable.");
            return;
        }
        var manifest = getManifest();
        var found = false;
        for (var i = 0; i < manifest.length; i++) {
            if (manifest[i].id === char.id) {
                manifest[i].name = char.name || "Unnamed";
                manifest[i].lastModified = new Date().toISOString();
                found = true;
                break;
            }
        }
        if (!found) {
            manifest.push({
                id: char.id,
                name: char.name || "Unnamed",
                lastModified: new Date().toISOString()
            });
        }
        setManifest(manifest);
    }

    function loadCharacter(id) {
        try {
            var data = localStorage.getItem(PREFIX + id);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }

    function listCharacters() {
        return getManifest();
    }

    function deleteCharacter(id) {
        try {
            localStorage.removeItem(PREFIX + id);
        } catch (e) {
            // Ignore removal errors
        }
        var manifest = getManifest();
        var filtered = manifest.filter(function (entry) {
            return entry.id !== id;
        });
        setManifest(filtered);
    }

    return {
        saveCharacter: saveCharacter,
        loadCharacter: loadCharacter,
        listCharacters: listCharacters,
        deleteCharacter: deleteCharacter,
        isAvailable: isAvailable
    };
})();
