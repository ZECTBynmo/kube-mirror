# Kube-mirror

Mirror a kubernetes environment locally - forwarding ports of services and modifying your hosts file so that services can connect to eachother.

## Installation

`npm install -g kube-mirror`

## Configuration yaml

You'll need to create a configuration file that lets kube-mirror know some information about your cluster

example:

```yaml
name: prod
services:
  mongo:
    port: 27017
  redis:
    name: redis-deployment
    port: 51235
    localPort: 6543
```

Once that's setup, you can load the config into kube-mirror

`kube-mirror load ./mirror-config.yaml`

## Usage

Mirror an entire environments

`kube-mirror mirror prod`