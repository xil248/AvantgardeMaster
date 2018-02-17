# Deploying

For deploying in production, we are using [PM2](http://pm2.keymetrics.io/) for process management.

## Steps to deploy

- cd into the avantgarde project directory `~/html/viz/avantgarde`.
- Run `sudo yarn build`.
- Run `pm2 start process.yml` to start / restart the app.

## To stop the app

- Run `pm2 stop process.yml`

## To delete the app

- Run `pm2 delete process.yml`
