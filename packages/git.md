# Git 

## Config

### `editor`
Changes the editor to nano
```shell script
git config --global core.editor "nano"
```

### `global gitignore`
```shell script
git config --global core.excludesfile ~/.gitignore_global
```


## Aliases

### `rd`
Adds all and commits with the message `Update README [skip ci]`
```shell script
git config --global alias.rd '!git add -A && git commit -m "Updates README [skip ci]"'
```

### `c`
Adds all and commits with the user-provided message
```shell script
git config --global alias.c '!git add -A && git commit -m'
```

### `pc`
Adds commits with a message and then pushes them
```shell script
git config --global alias.pc '!pc() { git add -A && git commit -m $1; git push }; pc'
```

### `up`
Pulls changes from the remote and rebases any local commits after the pulled commits while
removing any branches that no longer exist on the remote.
```shell script
git config --global alias.up '!git pull --rebase --prune $@ && git submodule update --init --recursive'
```

### `undo`
Resets the previous commit, but keeps all the changes from that commit in the working directory
```shell script
git config --global alias.undo 'reset HEAD~1 --mixed'
```

### `amend`
Amends the previous commit
```shell script
git config --global alias.amend 'commit -a --amend'
```

### `wipe`
Commits the working directory and then does a hard reset to remove it. The commit remains but
becomes unreachable. This allows for restoration if one's mind is changed.
```shell script
git config --global alias.wipe '!git add -A && git commit -qm 'WIPE' && git reset HEAD~1 --hard'
```

### `plog`
Colorizes git history
```shell script
git config --global alias.plog "log --graph --pretty='format:%C(red)%d%C(reset) %C(yellow)%h%C(reset) %ar %C(green)%aN%C(reset) %s'"
```

### `dc`
Shortcut to see what's changed since the last commit
```shell script
git config --global alias.dc 'diff --cached HEAD^'
```

### `ri`
Rebase interactively from a `[number]` of commits back `git ri 5`
```shell script
git config --global alias.ri '!ri() { git rebase -i HEAD~$1; }; ri'
```

### `f`
Searches for files and colorizes the output
```shell script
git config --global alias.f '!git ls-files | grep --color -i'
```

### `la`
Lists all configured aliases
```shell script
git config --global alias.la '!git config -l | grep alias | cut -c 7-'
```
