#!/usr/bin/env node
const KubeMirror = require('../src')

const {argv} = require('yargs')
  .alias('l', 'load')
  .describe('l', 'load in a mirror configuration yaml')
  .alias('m', 'mirror')
  .describe('m', 'mirror a kubernetes environment locally')

const [command, ...args] = argv._

const commands = {
  mirror: async (clusterName) => {
    const opts = argv
    const mirror = new KubeMirror()
    await mirror.mirror(clusterName, opts)
  },

  load: async (path) => {
    const opts = argv
    const mirror = new KubeMirror()
    
    await mirror.load(path, opts)
  }
}

const run = async () => {
  if (command === undefined) {
    console.log("No command specified, try --help")
    return
  } else if (commands[command] === undefined) {
    console.log(`Unknown command ${command}, try --help`)
    return
  }

  await commands[command].apply(null, args)
}

run()