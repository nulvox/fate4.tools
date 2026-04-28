"use strict";

const TabManager = (function () {
    const tabs = [];
    let activeTabId = null;

    function createTab(id, name) {
        const tab = { id: id, name: name || "Unnamed" };
        tabs.push(tab);
        renderTabBar();
        activateTab(id);
        return tab;
    }

    function activateTab(id) {
        activeTabId = id;
        renderTabBar();
        const content = document.getElementById("content");
        if (TabManager.onActivate) {
            TabManager.onActivate(id);
        } else {
            content.textContent = "Character: " + id;
        }
    }

    function closeTab(id) {
        const idx = tabs.findIndex(function (t) { return t.id === id; });
        if (idx === -1) return;
        tabs.splice(idx, 1);
        if (activeTabId === id) {
            if (tabs.length > 0) {
                activateTab(tabs[Math.max(0, idx - 1)].id);
            } else {
                activeTabId = null;
                renderTabBar();
                document.getElementById("content").textContent = "";
            }
        } else {
            renderTabBar();
        }
    }

    function renameTab(id, name) {
        const tab = tabs.find(function (t) { return t.id === id; });
        if (tab) {
            tab.name = name || "Unnamed";
            renderTabBar();
        }
    }

    function renderTabBar() {
        const bar = document.getElementById("tab-bar");
        const newBtn = document.getElementById("new-tab-btn");

        // Remove existing tab buttons (keep the + button)
        var existing = bar.querySelectorAll(".tab");
        existing.forEach(function (el) { el.remove(); });

        tabs.forEach(function (tab) {
            var btn = document.createElement("button");
            btn.className = "tab" + (tab.id === activeTabId ? " active" : "");
            btn.textContent = tab.name;
            btn.title = tab.name;
            btn.addEventListener("click", function () {
                activateTab(tab.id);
            });
            bar.insertBefore(btn, newBtn);
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
        getActiveTabId: getActiveTabId,
        getAllTabs: getAllTabs,
        onActivate: null
    };
})();
