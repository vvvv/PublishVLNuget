# PublishNuget

A Github Action to publish VL packages

## Disclaimer
This action is under development, please do not use for now

## Inputs

The following inputs can be used

| Input              | Description                                                                                                                                     |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| nuspec             | Optional. The path to the `.nuspec` file.                                                                                                       |
| solution           | Optional. A path to a `csproj` file, if the project has any.                                                                                    |
| icon-src           | Optional. An exteral source (url) for your nuget's icon, if the repo does not already have one.                                                 |
| icon-dst           | Mandatory if _Icon Src_ is set. Useless otherwise. The icon's full path, as expected in your nuspec file.                                       |
| nuget-key          | Optional. Your secret API key to publish your package                                                                                           |
| nuget-feed         | Optional. Sets the nuget feed to publish the nuget. Uses nuget.org's feed by default                                                            |
| use-symbols        | Optional. Allows to explicitly use symbols when packing the nuget. Defaults to `False`.                                                         |

- If you specify a `.nuspec` file, its version, dependencies and files will be taken into account
- If you don't specify a `.nuspec`, we assume this information is set in your `.csproj` file
- If you specify both, the `.nuspec` wins