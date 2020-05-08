const fs = require('fs')
const low = require('lowdb')
const yaml = require('js-yaml')
const spawn = require('cross-spawn')
const hostile = require('hostile')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({
  configs: []
}).write()

class KubeMirror {
  async mirror(clusterName, opts={}) {
    console.log("Mirroring", clusterName)

    const config = db.get('configs')
      .find({name: clusterName})
      .value()

    if (config === undefined) {
      console.log(`No config found for ${clusterName}, try running "kube-mirror load [yaml path] first`)
    }

    const configFile = fs.readFileSync(config.path, 'utf8')
    const configYaml = yaml.safeLoad(configFile)
    
    const omit = opts.omit ? opts.omit.split(',') : []
    if (omit.length > 0) {
      console.log("Omitting", omit.join(', '))
    }

    const services = configYaml.services

    for (let serviceName in services) {
      const service = services[serviceName]
      const forwardName = service.name || serviceName

      // Setup hosts file entry
      if (!opts.skipHostsFile) {
        await new Promise((resolve, reject) => {
          hostile.set('127.0.0.1', forwardName, (err) => {
            err ? reject(err) : resolve()
          })
        })

        console.log(`Setup hosts file entry for ${forwardName}`)
      }

      let shouldSkip = false
      for (let item of omit) {
        if (item.trim() === serviceName) {
          shouldSkip = true
          break
        }
      }

      if (shouldSkip || service.omit || service.skip) {
        continue
      }

      const targetPort = service.targetPort || service.localPort
      const portString = targetPort ? `${service.targetPort}:${service.port}` : service.port

      const command = ['port-forward', `services/${forwardName}`, portString]

      const child = spawn('kubectl', command, {stdio: 'inherit'})
    }
  }

  async remove(clusterName, opts={}) {
    console.log("Removing hosts files for", clusterName)

    const config = db.get('configs')
      .find({name: clusterName})
      .value()

    if (config === undefined) {
      console.log(`No config found for ${clusterName}, try running "kube-mirror load [yaml path] first`)
    }

    const configFile = fs.readFileSync(config.path, 'utf8')
    const configYaml = yaml.safeLoad(configFile)
    
    const omit = opts.omit ? opts.omit.split(',') : []
    if (omit.length > 0) {
      console.log("Omitting", omit.join(', '))
    }

    const services = configYaml.services

    for (let serviceName in services) {
      let shouldSkip = false
      for (let item of omit) {
        if (item.trim() === serviceName) {
          shouldSkip = true
          break
        }
      }

      if (shouldSkip) {
        continue
      }

      const service = services[serviceName]
      const forwardName = service.name || serviceName

      await new Promise((resolve, reject) => {
        hostile.remove('127.0.0.1', forwardName, (err) => {
          err ? reject(err) : resolve()
        })
      })
    }
  }

  async load(path) {
    const configFile = fs.readFileSync(path, 'utf8')
    const configYaml = yaml.safeLoad(configFile)

    db.get('configs')
      .push({name: configYaml.name, path: path})
      .write()

    console.log(`Config loaded: ${configYaml.name}`)
  }
}

module.exports = KubeMirror