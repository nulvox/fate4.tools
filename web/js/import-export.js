"use strict";

var ImportExport = (function () {

    function exportJSON(char) {
        var result = exportCharacter(JSON.stringify(char));
        var parsed;
        try {
            parsed = JSON.parse(result);
        } catch (e) {
            console.error("Export error:", e);
            return;
        }
        if (parsed.error) {
            console.error("Export error:", parsed.error);
            return;
        }

        var name = (char.name || "character").replace(/[^a-zA-Z0-9_-]/g, "_");
        var blob = new Blob([result], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = name + ".fate4.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importJSON(callback) {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,.fate4.json";
        input.addEventListener("change", function () {
            if (!input.files || input.files.length === 0) return;
            var file = input.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                var text = e.target.result;
                var result = importCharacter(text);
                var parsed;
                try {
                    parsed = JSON.parse(result);
                } catch (err) {
                    showImportError("Could not parse import result.");
                    return;
                }
                if (parsed.error) {
                    showImportError(parsed.error);
                    return;
                }
                var char = JSON.parse(parsed.character);
                callback(char, parsed.warnings || []);
            };
            reader.onerror = function () {
                showImportError("Could not read file.");
            };
            reader.readAsText(file);
        });
        input.click();
    }

    function showImportError(msg) {
        var existing = document.getElementById("import-error");
        if (existing) existing.remove();

        var banner = document.createElement("div");
        banner.id = "import-error";
        banner.style.cssText = "background:#e74c3c;color:#fff;padding:0.5rem 1rem;text-align:center;font-size:0.9rem;";
        banner.textContent = "Import error: " + msg;

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

    return {
        exportJSON: exportJSON,
        importJSON: importJSON
    };
})();
