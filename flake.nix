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
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          prisma-engines
          pkgs.openssl
        ];
        shellHook = ''
          export PRISMA_SCHEMA_ENGINE_BINARY="${prisma-engines}/bin/schema-engine"
          export PKG_CONFIG_PATH="${pkgs.openssl.dev}/lib/pkgconfig"
        '';
      };
    };
}