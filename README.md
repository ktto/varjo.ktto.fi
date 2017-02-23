### varjo.ktto.fi

```sh
$ nvm use
$ npm i
# local development
$ npm run watch
```

```sh
# build for prod
$ npm run build:prod
# Allow running node with privileged ports as non-root
$ sudo setcap 'cap_net_bind_service=+ep' `which node`
# run in prod
$ USERNAME=... PASSWORD=... SECRET=... npm run start:prod &
# or with logs
$ USERNAME=... PASSWORD=... SECRET=... npm run start:prod >> /path/to/info.log 2>> /path/to/error.log &
```

#### Why flat files?

I'm not interested in maitaining this. While otherwise bad (api design for example), flat files allow easy backups (thanks to github) and edit history (thanks to git).

