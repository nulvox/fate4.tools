"use strict";

var Theme = (function () {
    var STORAGE_KEY = "fate4_theme";

    function get() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function set(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (e) {
            // ignore
        }
    }

    function apply(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        var btn = document.getElementById("theme-toggle");
        if (btn) {
            btn.textContent = theme === "dark" ? "Light" : "Dark";
        }
    }

    function init() {
        var saved = get();
        if (saved) {
            apply(saved);
        } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            apply("dark");
        } else {
            apply("light");
        }

        var btn = document.getElementById("theme-toggle");
        if (btn) {
            btn.addEventListener("click", toggle);
        }
    }

    function toggle() {
        var current = document.documentElement.getAttribute("data-theme") || "light";
        var next = current === "dark" ? "light" : "dark";
        apply(next);
        set(next);
    }

    return {
        init: init,
        toggle: toggle
    };
})();
