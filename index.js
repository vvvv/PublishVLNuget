const core = require('@actions/core');
const spawnSync = require('child_process').spawnSync
const existsSync = require("fs").existsSync
const path = require('path')

class Action{
    constructor(){
        this.nuspec = core.getInput('nuspec')
        this.csproj = core.getInput('csproj')
        // Check if csproj is assigned. If it is, create an array with invidual entries or return an empty array
        this.csprojs = this.csproj ? this.csproj.split(/[,\n]+/).map(p => p.trim()).filter(Boolean) : []
        this.icon_src = core.getInput('icon-src')
        this.icon_dst = core.getInput('icon-dst')
        this.nuget_key = core.getInput('nuget-key')
        this.nuget_feed = core.getInput('nuget-feed')
        this.use_symbols = core.getInput('use-symbols')
        this.version = core.getInput('version')
    }

    // Executes a blocking command
    executeCommand(command){
        console.log(`==> Executing ${command}`)

        const INPUT = command.split(" ")
        const TOOL = INPUT[0], ARGS = INPUT.slice(1)
        
        return spawnSync(TOOL, ARGS, { encoding: 'utf-8' })
    }

    
    // Takes the result of a command, prints its stdout/stderr and fails the job if any stderr
    printCommandOutput(command){
        if(command.stdout){
            console.log('OK')
            console.log(command.stdout)
        }
        
          if(command.stderr){
            console.log('FAILURE')
            core.setFailed(command.stderr)
        }
    }

    fileExists(path){
        return existsSync(path)
    }

    // Builds a vs solution
    buildSolutions(do_pack){
        // Iterate over all csproj and build them
        for(const csproj of this.csprojs){
            console.log('Building project: ${csproj}')
            if(do_pack){
                // Builds the solution and packs the nuget. Package will go next to csproj
                var buildCommand = this.executeCommand(`msbuild ${csproj} /t:Build /v:m /m /restore /p:Configuration=Release /p:PackageOutputPath=./ /t:Pack`)
            }else{
                // Just builds the solution, packing is handled by the nuspec
                var buildCommand = this.executeCommand(`msbuild ${csproj} /t:Build /v:m /m /restore /p:Configuration=Release`)
            }
        
            this.printCommandOutput(buildCommand)
        }

    }

    // Downloads an icon
    downloadIcon(){
        if(!this.icon_dst){
            core.error('You provided an icon source but no destination, won\'t be able to pack your nuget!')
            core.setFailed('Please provide a destination for your icon')
        }else{
            var downloadCommand = this.executeCommand(`curl ${this.icon_src} -o ${this.icon_dst} --fail --silent --show-error`)
            this.printCommandOutput(downloadCommand)
            if(this.fileExists(this.icon_dst)){
                console.log("Succesfully retrieved package icon")
            }
        }
    }

    // Packs the nuget
    packNuget(){
        if(!this.version){
            // User did not specify version, we use the one in nuspec
            var packCommand = this.executeCommand(`nuget pack ${this.nuspec}`)
        }else{
            // User did specify a version, let's pack with it
            var packCommand = this.executeCommand(`nuget pack ${this.nuspec} -Version ${this.version}`)
        }
        
        this.printCommandOutput(packCommand)
    }

    // Pushes the nuget
    pushNuget(nupkg_path){
        if(this.use_symbols == 'true'){
            var pushCommand = this.executeCommand(`nuget push ${nupkg_path} ${this.nuget_key} -src ${this.nuget_feed} -SkipDuplicate`)
            this.printCommandOutput(pushCommand)
        }else{
            var pushCommand = this.executeCommand(`nuget push ${nupkg_path} ${this.nuget_key} -src ${this.nuget_feed} -NoSymbols -SkipDuplicate`)
            this.printCommandOutput(pushCommand)
        }
    }

    // Runs the job
    run(){
        // Check nonsense inputs
        if(!this.nuspec && !this.csproj){
            core.setFailed('You did not provide a nuspec or a csproj  file, I have nothing to pack here...')
        }

        // Retrieve icon
        if(this.icon_src){
            this.downloadIcon()
        }else{
            core.info('You did not specify any remote icon, moving to next step')
        }

        // Build solution
        if(this.csprojs.length > 0){
            if(!this.nuspec){
                this.buildSolutions(true)
            }else{
                this.buildSolutions(false)
            }
        }else{
            core.info('No csproj files specified, moving to next step')
        }

        // Pack the nuget
        // We only pack the nuget manually if the user has provided his own nuspec file
        // Otherwise, it means msbuild already took care of that
        if(this.nuspec){
            this.packNuget()
        }else{
            core.info('You did not provide any nuspec file, I\'m assuming msbuild created one. Moving on.')
        }
        
        // Push the nuget
        if(this.nuspec){
            this.pushNuget('*.nupkg')
        }else{
            this.pushNuget('.\\**\\*.nupkg')
        }
        
    }
}

new Action().run()
