# eslint-config-lunde

```sh
npm i -D eslint-config-lunde
```

> ESLint rules I'm using for my projects

- [x] Automatically detects TypeScript and adds appropriate parser/plugins
- [x] Automatically detects testing libraries and adds appropriate plugins and rules
- [x] Automatically detects React and adds appropriate plugins and rules

## Quick start

```json
// package.json
"eslintConfig": {
  "extends": ["lunde"]
}

// with overrides
"eslintConfig": {
  "extends": ["lunde"],
  "rules": {...}
}
```
