# PublishNuget

A Github Action to publish VL packages
## Usage

Create a `main.yml` under `.github/workflows/` and add the following content

```
# on push on master
on:
  push:
    branches:
      - master
    paths-ignore:
      - README.md

jobs:
  build:
    runs-on: windows-latest
    steps:
    - name: Git Checkout
      uses: actions/checkout@master
    
    - name: Setup MSBuild.exe
      uses: microsoft/setup-msbuild@v1.3.1

    - name: Setup Nuget.exe
      uses: nuget/setup-nuget@v1
      
    - name: Publish VL Nuget
      uses: vvvv/PublishVLNuget@1.0.46
      with:
        csproj: your\file.csproj
        nuspec: yyy\YourPlugin.nuspec
        icon-src: url/icon.png
        icon-dst: zzz/icon.png
        nuget-key: ${{ secrets.YOUR_NUGET_KEY }}
```

If your project has no solution and no external icon, simply use

```
[...]

    - name: Publish VL Nuget
      uses: vvvv/PublishVLNuget@1.0.46
      with:
        nuspec: yyy\YourPlugin.nuspec
        nuget-key: ${{ secrets.YOUR_NUGET_KEY }}
```

and remove the `Setup MSBuild.exe` step.

If your project contains multiple `csproj`, you can specify them in a comma separated list

```
[...]

    - name: Publish VL Nuget
      uses: vvvv/PublishVLNuget@1.0.46
      with:
        nuspec: yyy\YourPlugin.nuspec
        nuget-key: ${{ secrets.YOUR_NUGET_KEY }}
        csproj: 'your\first\file.csproj,your\second\file.csproj'
```

## Inputs

The following inputs can be used

| Input              | Description                                                                                                                                     |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| nuspec             | Optional. The path to the `.nuspec` file.                                                                                                       |
| csproj             | Optional. A comma-separated list of csproj, if the project has any.                                                                             |
| icon-src           | Optional. An exteral source (url) for your nuget's icon, if the repo does not already have one.                                                 |
| icon-dst           | Mandatory if _icon_src_ is set. Useless otherwise. The icon's full path, as expected in your nuspec file.                                       |
| nuget-key          | Optional. Your secret API key to publish your package                                                                                           |
| nuget-feed         | Optional. Sets the nuget feed to publish the nuget. Uses nuget.org's feed by default                                                            |
| use-symbols        | Optional. Allows to explicitly use symbols when packing the nuget. Defaults to `False`.                                                         |
| version            | Optional. If set, allows to override the version set in the nuspec file. Does not apply if packing with csproj, and must be valid semver                                                                                                                                                                 |

- If you specify a `.nuspec` file, its version, dependencies and files will be taken into account
- If you don't specify a `.nuspec`, we assume this information is set in your `.csproj` file
- If you specify both, the `.nuspec` wins
- If you specify a version, it will override the one from your nuspec. Only taken into account if using a `.nuspec`

## Notes

Keep in mind that paths in your `yml` files are relative to the repo's root. On the other hand, in the `nuspec`, they are relative to where the `nuspec` is.
