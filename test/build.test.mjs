import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

import { installInterop } from "../src/runtime.js";

const rootDir = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);

describe("@soundrussian-org/interop", () => {
  it("captures initial browser values in closure", () => {
    const fakeWindow = { location: { href: "https://example.com/page" } };
    const fakeDocument = { referrer: "https://referrer.example.com/" };

    const installed = installInterop(fakeWindow, fakeDocument);

    expect(installed).toBe(fakeWindow.AsgInterop);
    expect(fakeWindow.AsgInterop.getCurrentUrl()).toBe(
      "https://example.com/page",
    );
    expect(fakeWindow.AsgInterop.getReferrer()).toBe(
      "https://referrer.example.com/",
    );

    fakeWindow.location.href = "https://example.com/next";
    fakeDocument.referrer = "https://changed.example.com/";

    expect(fakeWindow.AsgInterop.getCurrentUrl()).toBe(
      "https://example.com/page",
    );
    expect(fakeWindow.AsgInterop.getReferrer()).toBe(
      "https://referrer.example.com/",
    );
  });

  it("fails fast for the CommonJS build outside a browser", () => {
    expect(() => require(path.join(rootDir, "dist", "index.cjs"))).toThrow(
      /window is not defined/,
    );
  });

  it("fails fast for the ESM build outside a browser", () => {
    try {
      execFileSync(
        process.execPath,
        ["--input-type=module", "-e", "import('./dist/index.js')"],
        {
          cwd: rootDir,
        },
      );
      throw new Error("Expected ESM build to fail outside a browser");
    } catch (error) {
      const stderr = error.stderr?.toString() || "";
      expect(stderr).toMatch(/window is not defined/);
    }
  });

  it("initializes window.AsgInterop from the IIFE bundle with captured values", async () => {
    const bundle = await readFile(
      path.join(rootDir, "dist", "interop.global.js"),
      "utf8",
    );
    const sandboxWindow = {
      location: { href: "https://sandbox.example.com/" },
    };
    const sandboxDocument = { referrer: "https://origin.example.com/" };
    const sandbox = {
      window: sandboxWindow,
      document: sandboxDocument,
    };

    vm.runInNewContext(bundle, sandbox);

    expect(typeof sandboxWindow.AsgInterop.getCurrentUrl).toBe("function");
    expect(sandboxWindow.AsgInterop.getCurrentUrl()).toBe(
      "https://sandbox.example.com/",
    );
    expect(sandboxWindow.AsgInterop.getReferrer()).toBe(
      "https://origin.example.com/",
    );

    sandboxWindow.location.href = "https://sandbox.example.com/changed";
    sandboxDocument.referrer = "https://other.example.com/";

    expect(sandboxWindow.AsgInterop.getCurrentUrl()).toBe(
      "https://sandbox.example.com/",
    );
    expect(sandboxWindow.AsgInterop.getReferrer()).toBe(
      "https://origin.example.com/",
    );
  });
});
