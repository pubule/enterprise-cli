# Enterprise CLI Workspace

This directory is used by Enterprise CLI for managing your projects.

## Structure

- `.enterprise/` - Workspace directory (this folder)
- `templates/custom/` - Your custom templates
- `.enterpriserc` - Workspace configuration

## Framework Version

Enterprise Framework: v2.0.0

## Usage

Generate a microservice:
```bash
ent generate my-service --domain user --package com.company.user
```

Generate a React app:
```bash
ent frontend create my-app --template material-ui
```

Check status:
```bash
ent status
```

## Documentation

For full documentation, visit the Enterprise CLI docs.
