const fs = require('fs')
const low = require('lowdb')
const yaml = require('js-yaml')
const spawn = require('cross-spawn')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

db.defaults({
  configs: []
}).write()

class KubeMirror {
  async mirror(clusterName) {
    const config = db.get('configs')
      .find({name: clusterName})
      .value()

    const configFile = fs.readFileSync(config.path, 'utf8')
    const configYaml = yaml.safeLoad(configFile)
    const services = configYaml.services

    for (let serviceName in services) {
      const service = services[serviceName]

      const forwardName = service.name || serviceName

      const targetPort = service.targetPort || service.localPort

      const portString = targetPort ? `${service.targetPort}:${service.port}` : service.port

      const command = ['port-forward', `services/${forwardName}`, portString]

      const child = spawn('kubectl', command, {stdio: 'inherit'})
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