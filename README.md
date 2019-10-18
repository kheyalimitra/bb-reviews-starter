# bb-reviews-starter
Bulletin Board Reviews Starter Project

## Logging

For logging, we're using [SAP/cf-nodejs-logging-support](https://github.com/SAP/cf-nodejs-logging-support). For adding any custom logs, please add according to the [Custom Logs Documentation](https://github.com/SAP/cf-nodejs-logging-support#custom-logs). **DO NOT USE console.log**, always use these custom logs.

## Dockerize the services

For dockerization, we are using the docker image to build up the node.js env. We have two Docker services. One is the base project, which is used to build up the web application service. The other is under srv, which is used to build up the api service.

Docker compose is used to combine the images into one docker container.

You can use the below commands to build and run the docker container:

```
docker-compose build
docker-compose start
```
## Automatic Scaling
For the performance of the application, sometimes we cannot improve the hardware anymore (vertical scaling). Therefore, we need to automatically increase the number of instances by horizontal scaling.

For monitoring, we will bind a autoscaler instance to the application via policy of certain metrics. The policy will define the rules and related thresholds for increasing/decreasing instances.
 

## Support
This project is provided "as-is": there is no guarantee that raised issues will be answered or addressed in future releases.

## License

Copyright (c) 2019 SAP SE or an SAP affiliate company. All rights reserved.
This project is licensed under the Apache Software License, Version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.