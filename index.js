const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const download = require('download-file')
const semver = require('semver')

try
{
    const nuspec = core.getInput('NUSPEC', { required: true })
    const solution = core.getInput('SOLUTION')
    const icon_src = core.getInput('ICON_SRC')
    const icon_dst = core.getInput('ICON_DST')
    const version = core.getInput('VERSION')
    const auto_increment_patch = core.getInput('AUTO_PATCH_NUMBER')
    const nuget_key = core.getInput('NUGET_KEY')
    const nuget_feed = core.getInput('NUGET_FEED')
    const use_symbols = core.getInput('USE_SYMBOLS')

    // msbuild
    if(solution){
        await exec.exec(`msbuild ${solution} /t:Build /v:m /m /restore /p:Configuration=Release`)
    }

    // icon
    if(icon_src){
        if(!icon_dst){
            // you asked to download an icon but did not tell me where to put it
            core.error('You provided an icon source but no destination, won\'t be able to pack your nuget!')
            core.setFailed('Please provide a destination for your icon')
        }else
        {
            // alrighty, proceed
            var options = {
                directory: icon_dst
            }
            download(icon_src, options, function(err){
                if (err) throw err
                console.log("Something went wrong downloading the file")
            })
        }
    }

    // pack der nuget
    if(version){
        sem = semver.parse(version)
        if(sem == null){
            core.error('The version you provided cannot be parsed to semver, please advise')
            core.setFailed('Please provide a valid semver version')
        }else{
            if(auto_increment_patch == true){
                // user wants to use github run number, let's set our semver object
                sem.patch = process.env.GITHUB_RUN_NUMBER
            }
            // pack with semver object
            await exec.exec(`nuget pack ${nuspec} -Version ${sem.version}`)
        }
    }else{
        // pack with nuspec version
        await exec.exec(`nuget pack ${nuspec}`)
    }

    // push der nuget
    if(use_symbols){
        await exec.exec(`nuget push *.nupkg ${nuget_key} -src ${nuget_feed}`)
    }else{
        await exec.exec(`nuget push *.nupkg ${nuget_key} -src ${nuget_feed} -NoSymbols`)
    }
    
}
catch
{
    // error handling
}