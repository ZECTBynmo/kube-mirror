# Kube-mirror

Mirror a kubernetes environment locally

## Why?

Kubernetes encourages microservices. That's a great development pattern, but sometimes debugging can be difficult because you need to run multiple services to work on or test functionality.

One approach is to setup a local Kubernetes cluster with a tool like `minikube` which can hold a local version of every service in your production cluster. Unfortunately it can sometimes be cumbersome to setup, and it's easy to let your local cluster drift from what's in your production environment. Also, if you need to switch between deployments in two different clusters you'll have a hard time doing that.

`kube-mirror` lets you get back to basics. Run the service you're trying to debug locally, using `npm start` directly. It works by calling `kubectl port-forward` using your currently configured kubectl context to expose local ports. `kube-mirror` also puts entries into your hosts file so that your local service can connect to mirrored services as if it were in the cluster.

Note: `kube-mirror` will allow your local service to interact with remote services. It will not allow remote services to make requests to your local services.

## Installation

`npm install -g kube-mirror`

Note: Installation will require `sudo` on some systems for the ability to modify hosts files.

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
  app:
    port: 9999
pods:
  - name: mypod-21s25a
    port: 5210
```

Once that's setup, you can load the config into kube-mirror

`kube-mirror load ./mirror-config.yaml`

`kube-mirror` only stores the path to your config file, so updates will be automatically reflected 

## Usage

Mirror an entire environments

`kube-mirror mirror prod`

If you're debugging a specific service locally, you may want to omit it from the mirror

`kube-mirror mirror prod --omit mongo,app`

Once you're done debugging a given environment, you can clean up your hosts file using:

`kube-mirror remove prod`