"use strict";

var Share = (function () {

    function toUrlSafeBase64(str) {
        return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    function fromUrlSafeBase64(str) {
        var s = str.replace(/-/g, "+").replace(/_/g, "/");
        while (s.length % 4 !== 0) {
            s += "=";
        }
        return s;
    }

    function compress(jsonStr) {
        var bytes = new TextEncoder().encode(jsonStr);
        var cs = new CompressionStream("deflate-raw");
        var writer = cs.writable.getWriter();
        writer.write(bytes);
        writer.close();
        return new Response(cs.readable).arrayBuffer().then(function (buf) {
            var arr = new Uint8Array(buf);
            var binary = "";
            for (var i = 0; i < arr.length; i++) {
                binary += String.fromCharCode(arr[i]);
            }
            return toUrlSafeBase64(btoa(binary));
        });
    }

    function decompress(encoded) {
        var standard = fromUrlSafeBase64(encoded);
        var binary = atob(standard);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        var ds = new DecompressionStream("deflate-raw");
        var writer = ds.writable.getWriter();
        writer.write(bytes);
        writer.close();
        return new Response(ds.readable).arrayBuffer().then(function (buf) {
            return new TextDecoder().decode(buf);
        });
    }

    function generateId() {
        if (crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback
        return "xxxx-xxxx-xxxx".replace(/x/g, function () {
            return Math.floor(Math.random() * 16).toString(16);
        });
    }

    function shareCharacter(char) {
        var json = JSON.stringify(char);
        compress(json).then(function (encoded) {
            var url = window.location.origin + window.location.pathname + "#char=" + encoded;
            copyToClipboard(url);
            showToast("Share link copied to clipboard");
        });
    }

    function loadFromHash() {
        var hash = window.location.hash;
        if (!hash || hash.indexOf("#char=") !== 0) {
            return Promise.resolve(null);
        }
        var encoded = hash.substring(6);
        return decompress(encoded).then(function (json) {
            var char = JSON.parse(json);
            // Always assign a new ID so it never collides with localStorage
            char.id = generateId();
            return char;
        }).catch(function () {
            // Try legacy uncompressed format as fallback
            try {
                var standard = fromUrlSafeBase64(encoded);
                var binary = atob(standard);
                var bytes = new Uint8Array(binary.length);
                for (var i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                var json = new TextDecoder().decode(bytes);
                var char = JSON.parse(json);
                char.id = generateId();
                return char;
            } catch (e) {
                return null;
            }
        });
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            return true;
        }
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

    return {
        shareCharacter: shareCharacter,
        loadFromHash: loadFromHash
    };
})();
