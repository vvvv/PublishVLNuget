const core = require('@actions/core');
const download = require('download-file')
const semver = require('semver')
const spawn = require('child_process').spawnSync

class Action{
    constructor(){
        this.nuspec = core.getInput('NUSPEC', { required: true })
        this.solution = core.getInput('SOLUTION')
        this.icon_src = core.getInput('ICON_SRC')
        this.icon_dst = core.getInput('ICON_DST')
        this.version = core.getInput('VERSION')
        this.auto_increment_patch = core.getInput('AUTO_PATCH_NUMBER')
        this.nuget_key = core.getInput('NUGET_KEY')
        this.nuget_feed = core.getInput('NUGET_FEED')
        this.use_symbols = core.getInput('USE_SYMBOLS')
    }

    runCmd(cmd){
        console.log(`Now running ${cmd}`)
        this.exec(cmd, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] })
    }

    exec(cmd, options){
        return spawn(cmd, options);
    }

    buildSolution(){
        this.runCmd(`msbuild ${this.solution} /t:Build /v:m /m /restore /p:Configuration=Release`)
    }

    downloadIcon(){
        if(!this.icon_dst){
            core.error('You provided an icon source but no destination, won\'t be able to pack your nuget!')
            core.setFailed('Please provide a destination for your icon')
        }else{
            var options = {
                directory: this.icon_dst
            }
            download(this.icon_src, options, function(err){
                if (err) throw err
                core.setFailed('Cannot download the icon')
            })
        }
    }

    packNuget(){
        if(this.version){
            sem = semver.parse(version)
            if(sem == null){
                core.error('The version you provided cannot be parsed to semver, please advise')
                core.setFailed('Please provide a valid semver version')
            }else{
                if(this.auto_increment_patch == true){
                    // user wants to use github run number, let's set our semver object
                    sem.patch = process.env.GITHUB_RUN_NUMBER
                }
                // pack with semver object
                this.runCmd(`nuget pack ${this.nuspec} -Version ${sem.version}`)
            }
        }else{
            // pack with nuspec version
            this.runCmd(`nuget pack ${nuspec}`)
        }
    }

    pushNuget(){
        if(this.use_symbols){
            this.runCmdrun(`nuget push *.nupkg ${nuget_key} -src ${nuget_feed}`)
        }else{
            this.runCmd(`nuget push *.nupkg ${nuget_key} -src ${nuget_feed} -NoSymbols`)
        }
    }

    run(){
        // Build VS solution
        if(this.solution){
            this.buildSolution()
        }else{
            core.info('Your nuget does not have a VS solution')
        }

        // Retrieve icon
        if(this.icon_src){
            this.downloadIcon()
        }else{
            core.info('Your did not specify any remote icon')
        }

        // Pack nuget
        this.packNuget()

        // Push nuget
        this.pushNuget()
    }
    
}

new Action().run()