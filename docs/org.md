`dvc org`
=========

Switch organizations

* [`dvc org`](#dvc-org)

## `dvc org`

Select which organization to access through the API

```
USAGE
  $ dvc org [--config-path <value>] [--auth-path <value>] [--client-id <value>] [--client-secret <value>]
    [--project <value>] [--no-api]

GLOBAL FLAGS
  --auth-path=<value>      [default: .devcycle/auth.yml] Override the default location to look for an auth.yml file
  --client-id=<value>      Client ID to use for DevCycle API Authorization
  --client-secret=<value>  Client Secret to use for DevCycle API Authorization
  --config-path=<value>    [default: .devcycle/config.yml] Override the default location to look for a config.yml file
  --no-api                 Disable API-based enhancements for commands where authorization is optional. Suppresses
                           warnings about missing credentials.
  --project=<value>        Project key to use for the DevCycle API requests

DESCRIPTION
  Select which organization to access through the API
```

_See code: [dist/commands/org/index.ts](https://github.com/DevCycleHQ/cli/blob/v2.0.3/dist/commands/org/index.ts)_