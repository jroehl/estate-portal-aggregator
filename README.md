# estate-portal-aggregator

This module helps to fetch and normalize real estate data from [immobilienscout24](https://www.immobilienscout24.de/) and/or [flowfact](https://www.flowfact.de/).

- [estate-portal-aggregator](#estate-portal-aggregator)
  - [CLI](#cli)
    - [generate-dictionary](#generate-dictionary)
    - [Immobilienscout24](#immobilienscout24)
      - [generate-dictionary](#generate-dictionary-1)
      - [fetch-estates](#fetch-estates)
      - [fetch-estate](#fetch-estate)
    - [FlowFact](#flowfact)
      - [generate-dictionary](#generate-dictionary-2)
      - [fetch-estates](#fetch-estates-1)
      - [fetch-estate](#fetch-estate-1)
  - [Usage as a module](#usage-as-a-module)
    - [Immobilienscout24](#immobilienscout24-1)
    - [FlowFact](#flowfact-1)
  - [TODO](#todo)

## CLI

> Every command has a `--help` flag that can be used to get more information about flags and arguments of the command

### generate-dictionary

Use this command to create a json file that includes all translation keys for the normalized real estate data properties.

`estate-portal generate-dictionary --help`

### Immobilienscout24

#### generate-dictionary

Use this command to create a json file that includes all translation keys for the normalized Immobilienscout24 real estate data.

```bash
estate-portal immobilienscout24 generate-dictionary --help
```

#### fetch-estates

Use this command to fetch all estates in a detailed or short version.

```bash
estate-portal immobilienscout24 fetch-estates --help
```

#### fetch-estate

Use this command to fetch a single estate in a detailed version.

```bash
estate-portal immobilienscout24 fetch-estate --help
```

### FlowFact

#### generate-dictionary

Use this command to create a json file that includes all translation keys for the normalized FlowFact real estate data.

```bash
estate-portal flowfact generate-dictionary --help
```

#### fetch-estates

Use this command to fetch all estates in a detailed or short version.

```bash
estate-portal flowfact fetch-estates --help
```

#### fetch-estate

Use this command to fetch a single estate in a detailed version.

```bash
estate-portal flowfact fetch-estate --help
```

## Usage as a module

Following functions are exported:

- fetchEstateImmobilienscout24
- fetchEstatesImmobilienscout24
- fetchEstateFlowFactV1
- fetchEstatesFlowFactV1
- fetchEstateFlowFactV2
- fetchEstatesFlowFactV2
- generateDictionaryCommonProperties
- generateDictionaryImmobilienscout24
- generateDictionaryFlowFactV1
- generateDictionaryFlowFactV2

### Immobilienscout24

Have a look at [fetch-estate.ts](src/commands/immobilienscout24_commands/fetch-estate.ts) and [fetch-estates.ts](src/commands/immobilienscout24_commands/fetch-estates.ts) to get an idea how to use the classes and functions

### FlowFact

Have a look at [fetch-estate.ts](src/commands/flowfact_commands/fetch-estate.ts) and [fetch-estates.ts](src/commands/flowfact_commands/fetch-estates.ts) to get an idea how to use the classes and functions

## TODO

- [ ] tests
- [x] integrate ci (github actions)
- [x] integrate [semantic-release](https://www.npmjs.com/package/semantic-release)