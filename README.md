# PublishNuget

A Github Action to publish VL packages

## Usage

The following arguments can be used

| Argument           | Description                                                                                                                                     |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| NUSPEC             | Mandatory. The path to the `.nuspec` file.                                                                                                      |
| SOLUTION           | Optional. A path to a Visual Studio solution, if the project has any.                                                                           |
| ICON_SRC           | Optional. An exteral source (url) for your nuget's icon, if the repo does not already have one.                                                 |
| ICON_DST           | Mandatory if _Icon Src_ is set. Useless otherwise. The path where your nuspec file expects the icon in your repo.                               |
| VERSION            | Optional. Sets your own Major.Minor.Patch version. Also accepts pre-release flags                                                               |
| AUTO_PATCH_NUMBER  | Optional. If true, automatically increments patch number                                                                                        |
| NUGET_KEY          | Optional. Your secret API key to publish your package                                                                                           |
| NUGET_FEED         | Optional. Sets the nuget feed to publish the nuget. Uses nuget.org's feed by default                                                            |
| USE_SYMBOLS        | Optional. Allows to explicitly use symbols when packing the nuget. Defaults to `False`.                                                         |