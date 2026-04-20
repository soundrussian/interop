import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";

import { installInterop } from "../src/runtime.js";

const rootDir = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);

test("installInterop captures initial browser values in closure", () => {
  const fakeWindow = { location: { href: "https://example.com/page" } };
  const fakeDocument = { referrer: "https://referrer.example.com/" };

  const installed = installInterop(fakeWindow, fakeDocument);

  assert.equal(installed, fakeWindow.AsgInterop);
  assert.equal(fakeWindow.AsgInterop.getCurrentUrl(), "https://example.com/page");
  assert.equal(fakeWindow.AsgInterop.getReferrer(), "https://referrer.example.com/");

  fakeWindow.location.href = "https://example.com/next";
  fakeDocument.referrer = "https://changed.example.com/";

  assert.equal(fakeWindow.AsgInterop.getCurrentUrl(), "https://example.com/page");
  assert.equal(fakeWindow.AsgInterop.getReferrer(), "https://referrer.example.com/");
});

test("CommonJS build fails fast outside a browser", () => {
  assert.throws(
    () => require(path.join(rootDir, "dist", "index.cjs")),
    /window is not defined/
  );
});

test("ESM build fails fast outside a browser", () => {
  try {
    execFileSync(process.execPath, ["--input-type=module", "-e", "import('./dist/index.js')"], {
      cwd: rootDir
    });
    assert.fail("Expected ESM build to fail outside a browser");
  } catch (error) {
    const stderr = error.stderr?.toString() || "";
    assert.match(stderr, /window is not defined/);
  }
});

test("IIFE build initializes window.AsgInterop with captured values", async () => {
  const bundle = await readFile(path.join(rootDir, "dist", "interop.global.js"), "utf8");
  const sandboxWindow = { location: { href: "https://sandbox.example.com/" } };
  const sandboxDocument = { referrer: "https://origin.example.com/" };
  const sandbox = {
    window: sandboxWindow,
    document: sandboxDocument
  };

  vm.runInNewContext(bundle, sandbox);

  assert.equal(typeof sandboxWindow.AsgInterop.getCurrentUrl, "function");
  assert.equal(sandboxWindow.AsgInterop.getCurrentUrl(), "https://sandbox.example.com/");
  assert.equal(sandboxWindow.AsgInterop.getReferrer(), "https://origin.example.com/");

  sandboxWindow.location.href = "https://sandbox.example.com/changed";
  sandboxDocument.referrer = "https://other.example.com/";

  assert.equal(sandboxWindow.AsgInterop.getCurrentUrl(), "https://sandbox.example.com/");
  assert.equal(sandboxWindow.AsgInterop.getReferrer(), "https://origin.example.com/");
});
