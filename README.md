This repo contains code for iframes used by Netdata Dashboard. The is made based on create-react-app, but with some `craco` overrides.

## Available Scripts

In the project directory, you can run:

### `npm run dev:remote`
Starts app in dev mode, on :443 port, which is normally used by https. To make it work, add:
```
127.0.0.1       {netdata cloud app hostname}
```
into your `/etc/hosts` file, and fill `.env.development` file with remote host (without protocol) and it's ip

The task needs `sudo` because Create-React-App won't allow hosting under :443 otherwise.

Currently it's not possible to login this way (todo!), so you'll need to login before making changes in `hosts` file

### `npm run dev`

Starts iframes in dev mode, on port :3001. Some other service needs to proxy to this port (for example cloud frontend)


### `npm run lint`, `npm run test`

Runs lint/test checks.

