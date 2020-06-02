# PublishNuget

A Github Action to publish VL packages

## Usage

The following arguments can be used

| Argument        | Description                                                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Nuspec          | Mandatory. The path to the `.nuspec` file.                                                                                                      |
| Solution        | Optional. A path to a Visual Studio solution, if the project has any.                                                                           |
| Icon Src        | Optional. An exteral source (url) for your nuget's icon, if the repo does not already have one.                                                 |
| Icon Dst        | Mandatory if _Icon Src_ is set. Useless otherwise. The path where your nuspec file expects the icon in your repo.                               |
| Version         | Optional. Uses the `Major.Minor.Patch` format. If `Patch` is "X", `github.run_number` will be used. If not set, will use nuspec file's version. |
| Prerelease Flag | Optional. Allows to add a pre-release flag to the package. Recommanded are `beta`, `alpha` or `rc` but any is accepted.                         |
| Nuget Feed      | Optional. Allows to set a custom Nuget feed. If not set, assumes nuget.org default feed.                                                        |
| Use Symbols     | Optional. Allows to explicitly use symbols when packing the nuget. Defaults to `False`.                                                         |