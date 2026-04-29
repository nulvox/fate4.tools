"use strict";

var Share = (function () {

    function toUrlSafeBase64(str) {
        return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    function fromUrlSafeBase64(str) {
        // Restore standard base64 characters and padding
        var s = str.replace(/-/g, "+").replace(/_/g, "/");
        while (s.length % 4 !== 0) {
            s += "=";
        }
        return s;
    }

    function encodeCharacter(char) {
        var json = JSON.stringify(char);
        var bytes = new TextEncoder().encode(json);
        var binary = "";
        for (var i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return toUrlSafeBase64(btoa(binary));
    }

    function decodeCharacter(encoded) {
        try {
            var standard = fromUrlSafeBase64(encoded);
            var binary = atob(standard);
            var bytes = new Uint8Array(binary.length);
            for (var i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            var json = new TextDecoder().decode(bytes);
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    }

    function generateLink(char) {
        var encoded = encodeCharacter(char);
        var url = window.location.origin + window.location.pathname + "#char=" + encoded;
        return url;
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            return true;
        }
        // Fallback for older browsers
        var textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        var ok = false;
        try {
            ok = document.execCommand("copy");
        } catch (e) {
            // ignore
        }
        document.body.removeChild(textarea);
        return ok;
    }

    function showToast(msg) {
        var existing = document.querySelector(".share-toast");
        if (existing) existing.remove();

        var toast = document.createElement("div");
        toast.className = "share-toast";
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(function () {
            if (toast.parentNode) toast.remove();
        }, 2600);
    }

    function shareCharacter(char) {
        var url = generateLink(char);
        copyToClipboard(url);
        showToast("Share link copied to clipboard");
    }

    function loadFromHash() {
        var hash = window.location.hash;
        if (!hash || hash.indexOf("#char=") !== 0) {
            return null;
        }
        var encoded = hash.substring(6);
        return decodeCharacter(encoded);
    }

    return {
        shareCharacter: shareCharacter,
        loadFromHash: loadFromHash
    };
})();
