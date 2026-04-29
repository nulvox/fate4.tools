"use strict";

var TabManager = (function () {
    var tabs = [];
    var activeTabId = null;

    function createTab(id, name) {
        var tab = { id: id, name: name || "Unnamed" };
        tabs.push(tab);
        renderTabBar();
        activateTab(id);
        return tab;
    }

    function activateTab(id) {
        activeTabId = id;
        renderTabBar();
        if (TabManager.onActivate) {
            TabManager.onActivate(id);
        } else {
            var content = document.getElementById("content");
            content.textContent = "Character: " + id;
        }
    }

    function closeTab(id, skipConfirm) {
        var idx = tabs.findIndex(function (t) { return t.id === id; });
        if (idx === -1) return;

        // Check if character has any data worth confirming
        var tab = tabs[idx];
        var hasData = tab.name && tab.name !== "Unnamed" && tab.name !== "";
        if (!skipConfirm && hasData && !confirm("Close \"" + tab.name + "\"? The character data will remain in storage.")) {
            return;
        }

        if (TabManager.onClose) {
            TabManager.onClose(id);
        }

        tabs.splice(idx, 1);
        if (activeTabId === id) {
            if (tabs.length > 0) {
                activateTab(tabs[Math.max(0, idx - 1)].id);
            } else {
                activeTabId = null;
                renderTabBar();
                if (TabManager.onEmpty) {
                    TabManager.onEmpty();
                } else {
                    document.getElementById("content").textContent = "";
                }
            }
        } else {
            renderTabBar();
        }
    }

    function renameTab(id, name) {
        var tab = tabs.find(function (t) { return t.id === id; });
        if (tab) {
            tab.name = name || "Unnamed";
            renderTabBar();
        }
    }

    function moveTab(id, direction) {
        var idx = tabs.findIndex(function (t) { return t.id === id; });
        if (idx === -1) return;
        var newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= tabs.length) return;
        var tmp = tabs[idx];
        tabs[idx] = tabs[newIdx];
        tabs[newIdx] = tmp;
        renderTabBar();
    }

    function startRename(tabEl, tabId) {
        var tab = tabs.find(function (t) { return t.id === tabId; });
        if (!tab) return;

        var nameSpan = tabEl.querySelector(".tab-name");
        if (!nameSpan) return;

        var input = document.createElement("input");
        input.type = "text";
        input.value = tab.name === "Unnamed" ? "" : tab.name;
        input.className = "tab-rename-input";

        function finishRename() {
            var newName = input.value.trim() || "Unnamed";
            tab.name = newName;
            renderTabBar();
            if (TabManager.onRename) {
                TabManager.onRename(tabId, newName);
            }
        }

        input.addEventListener("blur", finishRename);
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                input.blur();
            } else if (e.key === "Escape") {
                input.value = tab.name;
                input.blur();
            }
        });

        nameSpan.textContent = "";
        nameSpan.appendChild(input);
        input.focus();
        input.select();
    }

    function renderTabBar() {
        var bar = document.getElementById("tab-bar");
        var newBtn = document.getElementById("new-tab-btn");

        // Remove existing tab elements (keep the + button)
        var existing = bar.querySelectorAll(".tab");
        existing.forEach(function (el) { el.remove(); });

        tabs.forEach(function (tab, idx) {
            var tabEl = document.createElement("div");
            tabEl.className = "tab" + (tab.id === activeTabId ? " active" : "");
            tabEl.setAttribute("role", "tab");
            tabEl.setAttribute("tabindex", "0");
            tabEl.setAttribute("aria-selected", tab.id === activeTabId ? "true" : "false");
            tabEl.title = tab.name;

            var nameSpan = document.createElement("span");
            nameSpan.className = "tab-name";
            nameSpan.textContent = tab.name;
            tabEl.appendChild(nameSpan);

            var closeBtn = document.createElement("button");
            closeBtn.className = "tab-close";
            closeBtn.textContent = "\u00d7";
            closeBtn.title = "Close tab";
            closeBtn.setAttribute("aria-label", "Close " + tab.name);
            closeBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                closeTab(tab.id);
            });
            tabEl.appendChild(closeBtn);

            // Click to activate
            tabEl.addEventListener("click", function () {
                activateTab(tab.id);
            });

            // Double-click to rename
            tabEl.addEventListener("dblclick", function (e) {
                e.preventDefault();
                startRename(tabEl, tab.id);
            });

            // Keyboard: Enter/Space to activate, left/right to reorder
            tabEl.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    activateTab(tab.id);
                } else if (e.key === "ArrowLeft" && idx > 0) {
                    e.preventDefault();
                    moveTab(tab.id, -1);
                    // Focus the moved tab
                    var movedTab = bar.querySelectorAll(".tab")[idx - 1];
                    if (movedTab) movedTab.focus();
                } else if (e.key === "ArrowRight" && idx < tabs.length - 1) {
                    e.preventDefault();
                    moveTab(tab.id, 1);
                    var movedTab = bar.querySelectorAll(".tab")[idx + 1];
                    if (movedTab) movedTab.focus();
                } else if (e.key === "Delete") {
                    e.preventDefault();
                    closeTab(tab.id);
                } else if (e.key === "F2") {
                    e.preventDefault();
                    startRename(tabEl, tab.id);
                }
            });

            bar.insertBefore(tabEl, newBtn);
        });
    }

    function getActiveTabId() {
        return activeTabId;
    }

    function getAllTabs() {
        return tabs.slice();
    }

    return {
        createTab: createTab,
        activateTab: activateTab,
        closeTab: closeTab,
        renameTab: renameTab,
        moveTab: moveTab,
        getActiveTabId: getActiveTabId,
        getAllTabs: getAllTabs,
        onActivate: null,
        onEmpty: null,
        onRename: null,
        onClose: null
    };
})();
