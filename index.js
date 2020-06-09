const core = require('@actions/core');
const semver = require('semver')
const spawnSync = require('child_process').spawnSync
const existsSync = require("fs").existsSync
const readFileSync = require("fs").readFileSync
const parseString = require('xml2js').parseString;

class Action{
    constructor(){
        this.nuspec = core.getInput('nuspec', { required: true })
        this.solution = core.getInput('solution')
        this.icon_src = core.getInput('icon-src')
        this.icon_dst = core.getInput('icon-dst')
        this.version = core.getInput('version')
        this.auto_increment_patch = core.getInput('auto-patch-number')
        this.nuget_key = core.getInput('nuget-key')
        this.nuget_feed = core.getInput('nuget-feed')
        this.use_symbols = core.getInput('use-symbols')
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

    // Builds the vs solution
    buildSolution(){
        var buildCommand = this.executeCommand(`msbuild ${this.solution} /t:Build /v:m /m /restore /p:Configuration=Release`)
        this.printCommandOutput(buildCommand)
    }

    /*
    downloadIcon(){
        if(!this.icon_dst){
            core.error('You provided an icon source but no destination, won\'t be able to pack your nuget!')
            core.setFailed('Please provide a destination for your icon')
        }else{
            var downloadCommand = this.executeCommand(`curl ${this.icon_src} -o ${this.icon_dst} --fail --silent --show-error`)
            this.printCommandOutput(downloadCommand)
            if(existsSync(this.icon_dst)){
                console.log("Succesfully downloaded package icon")
            }
        }
    }
    */

    // Downloads an icon
    downloadIcon(){
        var nuspec = readFileSync(this.nuspec)
        var iconPath
        parseString(nuspec, function(err, result){
            iconPath = (String(result.package.metadata[0].icon))
        })
        if(iconPath){
            console.log(`Your icon will be downloaded to ${iconPath}`)
            var dlCommand = this.executeCommand(`curl ${this.icon_src} -o ${escape(iconPath)} --create-dir --fail --silent --show-error`)
            this.printCommandOutput(dlCommand)
            if(existsSync(iconPath)){
                console.log("OK")
                console.log("Succesfully downloaded package icon")
            }
        }else{
            core.setFailed('Cannot find an icon path in your nuspec file')
        }
    }

    // Packs the nuget
    packNuget(){
        if(this.version){
            var sem = semver.parse(this.version)
            if(sem == null){
                core.error('The version you provided cannot be parsed to semver, please advise')
                core.setFailed('Please provide a valid semver version')
            }
            else{
                if(this.auto_increment_patch == 'true'){
                    // increment patch number
                }
                var packCommand = this.executeCommand(`nuget pack ${this.nuspec} -Version ${sem.version}`)
                this.printCommandOutput(packCommand)
            }
        }
        else{
            // pack with nuspec version
            var packCommand = this.executeCommand(`nuget pack ${this.nuspec}`)
            this.printCommandOutput(packCommand)
        }
    }

    // Pushes the nuget
    pushNuget(){
        if(this.use_symbols == 'true'){
            var pushCommand = this.executeCommand(`nuget push *.nupkg ${this.nuget_key} -src ${this.nuget_feed}`)
            this.printCommandOutput(pushCommand)
        }else{
            var pushCommand = this.executeCommand(`nuget push *.nupkg ${this.nuget_key} -src ${this.nuget_feed} -NoSymbols`)
            this.printCommandOutput(pushCommand)
        }
    }

    // Runs the job
    run(){
        // Build VS solution
        if(this.solution){
            this.buildSolution()
        }else{
            core.info('Your nuget does not have a VS solution, moving to next step')
        }

        // Retrieve icon
        if(this.icon_src){
            this.downloadIcon()
        }else{
            core.info('You did not specify any remote icon, moving to next step')
        }

        // Pack nuget
        this.packNuget()

        // Push nuget
        this.pushNuget()
    }
    
}

new Action().run()