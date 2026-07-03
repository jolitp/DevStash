{
  description = "DevStash dev shell — provides Prisma 7 engines on NixOS";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      # Prisma 7 runs queries through the driver adapter (the query engine ships
      # inside @prisma/client), so only the native schema-engine is needed for
      # migrate / generate / validate. The v7 engines package provides just that.
      prisma-engines = pkgs.prisma-engines_7;

      # Playwright downloads generic prebuilt Chromium/Chrome binaries that are
      # dynamically linked against an FHS loader NixOS doesn't provide, so they
      # won't run — and its `channel: chrome` default looks for /opt/google/chrome
      # which doesn't exist here either. Instead we pin nixpkgs' properly-patched
      # Chromium and hand its path to the Playwright MCP via --executable-path
      # (see .mcp.json), which is version-independent since Playwright just drives
      # whatever binary it's given over CDP.
      chromium = pkgs.chromium;
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          prisma-engines
          pkgs.openssl
          chromium
        ];
        shellHook = ''
          export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine"
          export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig"

          # Point the Playwright MCP at the nix-provided Chromium and stop it from
          # trying to download / validate FHS host deps (both fail on NixOS).
          export PLAYWRIGHT_CHROMIUM_BIN="${chromium}/bin/chromium"
          export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
          export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
        '';
      };
    };
}