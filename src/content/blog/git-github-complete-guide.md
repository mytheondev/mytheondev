---
title: "Git and GitHub: a complete guide to daily commands and practices"
description: "A practical Git and GitHub guide covering daily commands, branching, remotes, recovery, and team workflows for everyday development."
pubDate: 2025-09-02
tags: [Git, GitHub]
minutes: 8
---

Git is the version control system most teams actually use. GitHub is where those repositories live and where review happens. This guide is the command set and the habits that hold up in daily work.

## Initialization and setup

### First-time config

Set your identity before the first commit:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@email.com"
git config --global init.defaultBranch main
```

### Creating repositories

```bash
# Start a new Git repository
git init

# Clone an existing repository
git clone <repo-url>
```

Always use `main` as the default branch. `master` is a leftover convention.

## Daily workflow

### Status and diffs

```bash
# Working tree status
git status

# Unstaged diffs
git diff

# Staged diffs
git diff --staged
```

### Staging and committing

```bash
git add <file>
git add .

git commit -m "Descriptive message"

# Stage tracked files and commit in one step
git commit -am "Message"
```

Keep commits small and focused. Write the subject in the imperative: "Add feature", not "Added feature". Conventional Commits help:

```bash
git commit -m "feat(auth): add login validation"
git commit -m "fix(api): handle null response in user service"
git commit -m "docs: update installation guide"
```

## Branches

```bash
git branch
git branch <name>
git switch <name>
git switch -c <name>
git branch -d <name>
git branch -D <name>
```

Name branches as `type/short-description`:

```bash
git switch -c feature/user-authentication
git switch -c fix/login-validation-bug
git switch -c hotfix/critical-security-patch
git switch -c docs/update-readme
```

## Integration and remotes

```bash
git merge <branch>
git merge --no-ff <branch>
```

```bash
git remote add <name> <url>
git remote -v
git push <remote> <branch>
git pull <remote> <branch>
git fetch <remote>
```

Pull before you push. It is cheaper than resolving a rejected history later.

## Undo and cleanup

```bash
git fetch

# Discard local changes
git reset --hard HEAD

# Invert a specific commit
git revert <commit-hash>

# Undo commits, keep the working tree
git reset --soft HEAD~1

# Undo commits and discard the changes
git reset --hard HEAD~1
```

```bash
git clean -f
git clean -fd
git clean -n
```

`reset --hard` and `clean` destroy work. Use them only when you mean it.

## History, stash, rebase

```bash
git diff <a> <b>
git show <hash>
git log --oneline
git log --graph --oneline --all
```

```bash
git stash
git stash list
git stash pop
git stash apply stash@{0}
git stash clear
```

```bash
git cherry-pick <hash>
git rebase <base>
git rebase -i HEAD~3
```

## Workflows

### A simple Git Flow

1. `main` is production.
2. Feature branches carry new work.
3. Hotfix branches carry urgent fixes.

```bash
git switch -c feature/new-capability
git add .
git commit -m "feat: implement new capability"
git switch main
git pull origin main
git merge feature/new-capability
git push origin main
git branch -d feature/new-capability
```

### GitHub Flow

1. Branch from `main`.
2. Commit.
3. Open a pull request.
4. Review.
5. Merge to `main`.

## Practices that pay off

### `.gitignore`

```text
node_modules/
*.log
dist/
build/
.env
.env.local
.vscode/
.idea/
.DS_Store
Thumbs.db
```

### Conventional Commits

- `feat:` new behavior
- `fix:` a bug
- `docs:` documentation
- `style:` formatting only
- `refactor:` structure without behavior change
- `test:` tests
- `chore:` maintenance

### Useful defaults

```bash
git config --global pull.rebase true
git config --global push.default current
git config --global core.autocrlf input
git config --global init.defaultBranch main
```

## Common recoveries

### Merge conflicts

```bash
git status
# Edit the conflicted files
git add <resolved-file>
git commit -m "resolve merge conflicts"
```

### Amend the last commit

```bash
git commit --amend -m "New message"
git add forgotten-file.js
git commit --amend --no-edit
```

Only amend commits that have not been pushed, or that your team agrees to rewrite.

### Lost work

```bash
git reflog
git reset --hard HEAD@{2}
```

## Aliases and tools

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
```

GUI options if you want them: GitHub Desktop, GitKraken, Sourcetree, and the Git integration in VS Code / Cursor.

## Closing

The commands matter less than using them the same way every day. Practice in a throwaway repo, pick a flow with your team, and automate the boring parts with hooks when the pattern is stable.
