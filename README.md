# Kube-mirror

Mirror a kubernetes environment locally

## Why?

Kubernetes encourages microservices. That's a great development pattern, but sometimes debugging can be difficult because you need to run multiple services to work on or test functionality.

One approach is to setup a local Kubernetes cluster with a tool like `minikube` which can hold a local version of every service you your production cluster. That's great for a lot of use cases, but it can sometimes be cumbersome to setup, and it's easy to let your local cluster drift from what's in your production environment. Also, if you need to switch between deployments in two different clusters you'll have a hard time doing that.

`kube-mirror` lets you get back to basics. Run the service you're trying to debug locally, using `npm start` directly, by using `kubectl port-forward` on your services, and putting entries into your hosts file so that your local service can connect to mirrored services as if it were in the cluster.

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
  app:
    port: 9999
```

Once that's setup, you can load the config into kube-mirror

`kube-mirror load ./mirror-config.yaml`

## Usage

Mirror an entire environments

`kube-mirror mirror prod`

If you're debugging a specific service locally, you may want to omit it from the mirror

`kube-mirror mirror prod --omit mongo,app`