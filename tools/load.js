const fs = require("fs"), vm = require("vm"), path = require("path");
const ROOT = path.join(__dirname, "..");
const ctx = { console: console };
vm.createContext(ctx);
function load(f) { vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f }); }
function run(code) { return vm.runInContext(code, ctx); }
module.exports = { ctx, load, run };
